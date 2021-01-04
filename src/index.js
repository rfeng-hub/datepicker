import './index.scss'

import calendar from './data.js'

calendar.init('.datepicker')

if (process.env.NODE_ENV === 'development') {
  console.log('development');
} else {
  console.log('production');
}