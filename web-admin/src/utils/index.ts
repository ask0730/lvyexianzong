import moment from 'moment';
moment.locale('zh-cn');
export function formatTime(date: string) {
  return moment.utc(date).local().format('YYYY-MM-DD HH:mm:ss');
}
