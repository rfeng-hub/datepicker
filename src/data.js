module.exports = {
  wrapperElement: null,
  monthData: null,
  inputElement: null,
  /**
    * 格式化日期
    * **/
  formatDate(date) {
    return (
      date.getFullYear() +
      "/" +
      this.formatMD(date.getMonth() + 1) +
      "/" +
      this.formatMD(date.getDate())
    )
  },
  /**
    * 格式化日期
    * **/
  formatDatetime(date) {
    return (
      date.getFullYear() +
      "/" +
      this.formatMD(date.getMonth() + 1) +
      "/" +
      this.formatMD(date.getDate()) +
      " " +
      this.formatMD(date.getHours()) +
      ":" +
      this.formatMD(date.getMinutes())
    )
  },
  /**
   * 处理月 日 显示 个位补0
   */
  formatMD(num) {
    return num >= 10 ? num.toString() : "0" + num;
  },
  /**
   * 获取某个月的date信息
   * @param {String} year 年
   * @param {String} month 月
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
    if (firstDayWeekDay === 0) {  // 周日
      firstDayWeekDay = 7
    }

    year = firstDay.getFullYear()
    month = firstDay.getMonth() + 1

    const lastDayOfLastMonth = new Date(year, month - 1, 0)  // 获取最后一天
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
        showDate: showDate
      })
    }
    return {
      year: year,
      month: month,
      days: ret
    }
  },
  init(selector) {
    this.render()

    // 控制显示或者隐藏
    this.inputElement = document.querySelector(selector)
    this.inputElement.addEventListener('focus', () => {
      this.wrapperElement.classList.add('ui-datepicker-wrapper-show')
      const left = this.inputElement.offsetLeft
      const top = this.inputElement.offsetTop
      const height = this.inputElement.offsetHeight
      this.wrapperElement.style.top = top + height + 2 + 'px'
      this.wrapperElement.style.left = left + 'px'
    })
    this.wrapperElement.addEventListener('click', (e) => {
      const target = e.target

      if (target.classList.contains('ui-datepicker-btn')) {
        if (target.classList.contains('ui-datepicker-prev-btn')) {
          this.render('prev')
        } else {
          this.render('next')
        }
      } else if (target.tagName.toLocaleLowerCase() === 'td') {
        const date = new Date(this.monthData.year, this.monthData.month - 1, target.dataset.date)
        this.inputElement.value = this.formatDate(date)
        this.wrapperElement.classList.remove('ui-datepicker-wrapper-show')
      }
    })
  },
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
    console.log(year, month);
    const html = this.buildUi(year, month)
    console.log(this.monthData.year, this.monthData.month);
    if (!this.wrapperElement) {
      this.wrapperElement = document.createElement('div')
      this.wrapperElement.innerHTML = `
      <div class="ui-datepicker-header">
				<a class="ui-datepicker-btn ui-datepicker-prev-btn">&lt;</a>
				<a class="ui-datepicker-btn ui-datepicker-next-btn">&gt;</a>
				<span class="ui-datepicker-curr-month"></span>
			</div>
			<div class="ui-datepicker-body">
				<table>
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
      </div>`
      this.wrapperElement.className = 'ui-datepicker-wrapper'
      document.body.appendChild(this.wrapperElement)
    }
    this.wrapperElement.querySelector("tbody").innerHTML = html
    this.wrapperElement.querySelector('.ui-datepicker-curr-month').innerText = this.monthData.year + '-' + this.monthData.month
  },
  buildUi(year, month) {
    this.monthData = this.getMonthDate(year, month)  // 获取一个月的数据
    console.log(this.monthData);
    let html = ''
    const days = this.monthData.days
    for (let i in days) {
      const date = days[i]
      if (i % 7 === 0) {
        html += '<tr>'
      }
      html += `<td data-date=${date.date}>${date.showDate}</td>`
      if (i % 7 === 6) {
        html += '</tr>'
      }
    }

    return html
  }
}