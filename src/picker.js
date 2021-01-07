import './index.scss'
import $ from 'jquery'

class DatePicker {
  constructor(selector, config) {
    this.inputElement = document.querySelector(selector) // 输入框DOM
    this.wrapperElement = null // 日历DOM
    this.monthData = null // 月份date信息
    this.now = this.formatDate(new Date()) // 当天日期
    this.current = this.isValidDate(this.inputElement.value)
      ? this.formatDate(new Date(this.inputElement.value))
      : '' // 当前选中的日期
    this.currentYear = '' // 选中日期的年
    this.currentMonth = '' // 选中日期的月
    this.currentDate = '' // 选中日期的日
    this.showYear = this.current ? this.current.split('-')[0] : ''    // 展示的年份
    this.showMonth = this.current ? parseInt(this.current.split('-')[1]) : ''   // 展示的月份，从1开始
    this.yearChangeMode = 0   // 年份切换模式，0：切换年份，查看日历；1：切换年分区间；2：切换年份，选择月份
    console.log(this.showYear, this.showMonth);
    $(this.inputElement).data('datePicker', true)
    if (config) {
      if (config.readonly) {
        this.inputElement.setAttribute('readonly', config.readonly)
      }
    }
    this.init()
  }
  init() {
    this.render()

    // 控制日期选择控件显示或者隐藏
    this.inputElement.addEventListener('click', () => {
      $('.ui-datepicker-wrapper-show').removeClass('ui-datepicker-wrapper-show')
      if (
        this.wrapperElement.classList.contains('ui-datepicker-wrapper-show')
      ) {
        // 绑定的日期控件已显示，忽略
        return false
      }
      if (this.yearChangeMode !== 0) {
        $(this.wrapperElement).find('.ui-year-table').hide()
        $(this.wrapperElement).find('.ui-month-table').hide()
        this.jump()
        $(this.wrapperElement).find('.ui-datepicker-show-month').show()
        $(this.wrapperElement).find('.ui-datepicker-prev-btn').show()
        $(this.wrapperElement).find('.ui-datepicker-next-btn').show()
        $(this.wrapperElement).find('.ui-date-table').show()
        this.yearChangeMode = 0
      }
      this.wrapperElement.classList.add('ui-datepicker-wrapper-show')
      const left = this.inputElement.offsetLeft
      const top = this.inputElement.offsetTop
      const height = this.inputElement.offsetHeight
      this.wrapperElement.style.cssText = `top: ${top + height
        }px;left:${left}px`
    })
    // 控制点击外部隐藏控件
    document.addEventListener('click', (e) => {
      /**
       * @type HTMLElement
       */
      const target = e.target
      if (!document.querySelector('.ui-datepicker-wrapper-show')) {
        // 当前没有日期选择控件显示
        return false
      }
      // 当前有日期选择控件显示
      if (
        target.classList.contains('ui-datepicker-wrapper-show') ||
        $(target).parents('.ui-datepicker-wrapper-show').length ||
        $(target).data('datePicker')
      ) {
        // 点击的不是日期选择控件内部或绑定了日期选择控件的输入框
        return false
      }
      this.wrapperElement.classList.remove('ui-datepicker-wrapper-show')
    })
    // 点击按钮切换年/月
    this.wrapperElement.addEventListener('click', (e) => {
      this.isClicked = true
      const target = e.target

      const classList = target.classList
      if (!classList.contains('ui-datepicker-btn')) {
        return
      }
      if (classList.contains('ui-datepicker-prev-btn')) {
        this.render('prev')
      } else if (classList.contains('ui-datepicker-next-btn')) {
        this.render('next')
      } else if (classList.contains('ui-datepicker-double-prev-btn')) {
        if (this.yearChangeMode === 0) {
          this.showYear--
          this.jump()
        } else if (this.yearChangeMode === 1) {
          this.showYear -= 10
          this.changeYearRange()
        } else {
          this.showYear--
          $(this.wrapperElement).find('.ui-datepicker-show-year').text(`${this.showYear}年`)
        }
      } else if (classList.contains('ui-datepicker-double-next-btn')) {
        if (this.yearChangeMode === 0) {
          this.showYear++
          this.jump()
        } else if (this.yearChangeMode === 1) {
          this.showYear += 10
          this.changeYearRange()
        } else {
          this.showYear++
          $(this.wrapperElement).find('.ui-datepicker-show-year').text(`${this.showYear}年`)
        }
      }
    })
    // 点击年/月切换年/月
    this.wrapperElement.addEventListener('click', (e) => {
      /**
       * @type HTMLElement
       */
      const target = e.target

      const classList = target.classList
      if (!classList.contains('ui-datepicker-header-label')) {
        return false
      }
      $(this.wrapperElement).find('.ui-date-table').hide()
      $(this.wrapperElement).find('.ui-datepicker-prev-btn').hide()
      $(this.wrapperElement).find('.ui-datepicker-next-btn').hide()
      $(this.wrapperElement).find('.ui-datepicker-show-month').hide()
      if (classList.contains('ui-datepicker-show-year')) {
        this.yearChangeMode = 1
        this.changeYearRange()
        $(this.wrapperElement).find('.ui-year-table').show()
      } else if (classList.contains('ui-datepicker-show-month')) {
        this.yearChangeMode = 2
        $(this.wrapperElement).find('.ui-month-table').show()
      }
    })
    // 选择日期
    this.wrapperElement.querySelector('.ui-date-table').addEventListener('click', (e) => {
      /**
       * @type HTMLElement
       */
      const target = e.target
      if (target.tagName.toLocaleLowerCase() !== 'td') {
        if (target.parentElement.tagName.toLocaleLowerCase() !== 'td') {
          return false
        }
        this.fillDate(target.parentElement)
        return false
      }
      this.fillDate(target)
    })
    // 选择年份
    this.wrapperElement.querySelector('.ui-year-table').addEventListener('click', (e) => {
      /**
       * @type HTMLElement
       */
      const target = e.target
      if (target.tagName.toLocaleLowerCase() !== 'td') {
        return false
      }
      this.showYear = target.dataset.year
      console.log(this.showYear, this.showMonth);
      this.yearChangeMode = 2
      $(this.wrapperElement).find('.ui-year-table').hide()
      $(this.wrapperElement).find('.ui-month-table').show()
    })
    // 选择月份
    this.wrapperElement.querySelector('.ui-month-table').addEventListener('click', (e) => {
      /**
       * @type HTMLElement
       */
      const target = e.target
      if (target.tagName.toLocaleLowerCase() !== 'td') {
        return false
      }
      this.showMonth = target.dataset.month
      console.log(this.showYear, this.showMonth);
      this.jump()
    })
  }
  /**
   * 渲染一个月的日历
   * @param {String} direction 上/下
   */
  render(direction) {
    let year, month
    if (this.monthData) {
      year = this.monthData.year
      month = this.monthData.month
    }
    if (direction === 'prev') {
      month--
    } else if (direction === 'next') {
      month++
    }
    if (month === 0) {
      month = 12
      year--
    }
    const dateBody = this.buildDate(year, month)
    if (!this.wrapperElement) {
      this.wrapperElement = document.createElement('div')
      this.wrapperElement.innerHTML = `
      <div class="ui-datepicker-header">
        <i class="ui-datepicker-btn ui-datepicker-double-prev-btn iconfont icon-double-left-arrow"></i>
				<i class="ui-datepicker-btn ui-datepicker-prev-btn iconfont icon-left-arrow"></i>
				<span class="ui-datepicker-header-label ui-datepicker-show-year"></span>
				<span class="ui-datepicker-header-label ui-datepicker-show-month"></span>
				<i class="ui-datepicker-btn ui-datepicker-double-next-btn iconfont icon-double-right-arrow"></i>
				<i class="ui-datepicker-btn ui-datepicker-next-btn iconfont icon-right-arrow"></i>
			</div>
			<div class="ui-datepicker-body">
				<table cellspacing="0" cellpadding="0" class="ui-date-table">
					<thead>
						<tr>
							<th>一</th>
							<th>二</th>
							<th>三</th>
							<th>四</th>
							<th>五</th>
							<th>六</th>
							<th>日</th>
						</tr>
					</thead>
          <tbody>
          </tbody>
        </table>
        <table class="ui-year-table" style="display:none">
          <tbody>
          </tbody>
        </table>
        <table class="ui-month-table" style="display:none">
          <tbody>
            <tr>
              <td data-month='1'>一月</td>
              <td data-month='2'>二月</td>
              <td data-month='3'>三月</td>
              <td data-month='4'>四月</td>
            </tr>
            <tr>
              <td data-month='5'>五月</td>
              <td data-month='6'>六月</td>
              <td data-month='7'>七月</td>
              <td data-month='8'>八月</td>
            </tr>
            <tr>
              <td data-month='9'>九月</td>
              <td data-month='10'>十月</td>
              <td data-month='11'>十一月</td>
              <td data-month='12'>十二月</td>
            </tr>
          </tbody>
        </table>
      </div>`
      this.wrapperElement.className = 'ui-datepicker-wrapper'
      document.body.appendChild(this.wrapperElement)
    }
    $(this.wrapperElement).find('.ui-date-table tbody').html(dateBody)
    $(this.wrapperElement).find('.ui-datepicker-show-year').text(`${this.showYear}年`)
    $(this.wrapperElement).find('.ui-datepicker-show-month').text(`${this.showMonth}月`)
  }
  // 跳到指定年月
  jump() {
    const dateBody = this.buildDate(this.showYear, this.showMonth)
    $(this.wrapperElement).find('.ui-date-table tbody').html(dateBody)
    $(this.wrapperElement).find('.ui-month-table').hide()
    $(this.wrapperElement).find('.ui-date-table').show()
    $(this.wrapperElement).find('.ui-datepicker-prev-btn').show()
    $(this.wrapperElement).find('.ui-datepicker-next-btn').show()
    $(this.wrapperElement).find('.ui-datepicker-show-year').text(`${this.showYear}年`)
    $(this.wrapperElement).find('.ui-datepicker-show-month').text(`${this.showMonth}月`)
    $(this.wrapperElement).find('.ui-datepicker-show-month').show()
  }
  /**
   * 显示年份区间，十个年份一个区间
   */
  changeYearRange() {
    let startYear = Math.floor(this.showYear / 10) * 10
    $(this.wrapperElement).find('.ui-datepicker-show-year').text(`${startYear}年 - ${startYear + 9}年`)
    let html = ''
    for (let i = 0; i < 10; i++) {
      if (i % 4 === 0) {
        html += '<tr>'
      }
      html += `<td data-year=${startYear}>${startYear}年</td>`
      if (i % 4 === 3) {
        html += '</tr>'
      }
      startYear++
    }
    this.wrapperElement.querySelector('.ui-year-table tbody').innerHTML = html
  }
  /**
   * 填入选择的日期
   */
  fillDate(dateElement) {
    const selectedDate = dateElement.dataset.date
    const date = new Date(
      this.monthData.year,
      this.monthData.month - 1,
      selectedDate
    )
    const activeTd = this.wrapperElement.querySelector('td.current')
    if (activeTd) {
      activeTd.classList.remove('current')
    }
    dateElement.classList.add('current')
    this.current = this.formatDate(date)
    this.inputElement.value = this.current
    if (selectedDate < 0) {
      // 上个月
      this.render('prev')
    } else if (selectedDate > this.monthData.lastDate) {
      // 下个月
      this.render('next')
    }
    this.wrapperElement.classList.remove('ui-datepicker-wrapper-show')
  }
  /**
   * 获取某个月的date信息
   */
  getMonthDate(year, month) {
    const ret = []
    if (!year || !month) {
      const today = new Date()
      year = today.getFullYear()
      month = today.getMonth() + 1
    }
    const firstDay = new Date(year, month - 1, 1) // 获取当月第一天
    let firstDayWeekDay = firstDay.getDay() // 获取星期几，才好判断排在第几列
    if (firstDayWeekDay === 0) {
      // 周日
      firstDayWeekDay = 7
    }

    year = firstDay.getFullYear()
    month = firstDay.getMonth() + 1
    this.showYear = year
    this.showMonth = month
    const lastDayOfLastMonth = new Date(year, month - 1, 0) // 获取最后一天
    const lastDateOfLastMonth = lastDayOfLastMonth.getDate()

    const preMonthDayCount = firstDayWeekDay - 1
    const lastDay = new Date(year, month, 0)
    const lastDate = lastDay.getDate()

    for (let i = 0; i < 42; i++) {
      const date = i + 1 - preMonthDayCount
      let showDate = date
      let thisMonth = month

      // 上一月
      if (date <= 0) {
        thisMonth = month - 1
        showDate = lastDateOfLastMonth + date
      } else if (date > lastDate) {
        // 下一月
        thisMonth = month + 1
        showDate = showDate - lastDate
      }
      if (thisMonth === 0) {
        thisMonth = 12
      } else if (thisMonth === 13) {
        thisMonth = 1
      }
      ret.push({
        month: thisMonth,
        date: date,
        showDate: showDate,
      })
    }
    return {
      year: year,
      month: month,
      lastDate: lastDateOfLastMonth,
      days: ret,
    }
  }


  /**
   * 生成一个月的日期
   */
  buildDate(year, month) {
    this.monthData = this.getMonthDate(year, month) // 获取一个月的数据
    // console.log(this.monthData)
    let html = ''
    const days = this.monthData.days

    for (let i in days) {
      if (i % 7 === 0) {
        html += '<tr>'
      }
      const date = days[i]
      const time =
        this.monthData.year +
        '-' +
        this.formatMD(this.monthData.month) +
        '-' +
        this.formatMD(date.date)
      let tdClass =
        date.date <= 0
          ? 'prev-month'
          : date.date > this.monthData.lastDate
            ? 'next-month'
            : this.now === time
              ? 'available today'
              : 'available'
      tdClass += this.current === time ? ' current' : ''
      html += `<td data-date=${date.date} 
      class="${tdClass}"><span>${date.showDate}</span></td>`
      if (i % 7 === 6) {
        html += '</tr>'
      }
    }

    return html
  }
  buildYear(year) {

  }
  /**
   * 恢复日期选择控件到选择日模式
   */
  restore() {
    $(this.wrapperElement).find('.ui-year-table').hide()
    $(this.wrapperElement).find('.ui-month-table').hide()
    $(this.wrapperElement).find('.ui-date-table').show()
    $(this.wrapperElement).find('.ui-datepicker-prev-btn').show()
    $(this.wrapperElement).find('.ui-datepicker-next-btn').show()
    $(this.wrapperElement).find('.ui-datepicker-show-year').text(`${this.showYear}年`)
    $(this.wrapperElement).find('.ui-datepicker-show-month').text(`${this.showMonth}月`)
    $(this.wrapperElement).find('.ui-datepicker-show-month').show()
  }
  /**
   * 判断是不是合法的日期字符串
   */
  isValidDate(dateString) {
    if (isNaN(new Date(dateString).getDate())) {
      return false
    }
    return true
  }
  /**
   * 格式化日期
   * **/
  formatDate(date) {
    return (
      date.getFullYear() +
      '-' +
      this.formatMD(date.getMonth() + 1) +
      '-' +
      this.formatMD(date.getDate())
    )
  }
  /**
   * 格式化日期
   * **/
  formatDatetime(date) {
    return (
      date.getFullYear() +
      '-' +
      this.formatMD(date.getMonth() + 1) +
      '-' +
      this.formatMD(date.getDate()) +
      ' ' +
      this.formatMD(date.getHours()) +
      ':' +
      this.formatMD(date.getMinutes())
    )
  }
  /**
   * 处理月 日 显示 个位补0
   */
  formatMD(num) {
    return num >= 10 ? num.toString() : '0' + num
  }
}

export default DatePicker
