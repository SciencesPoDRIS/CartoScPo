import angular from 'angular';
import timeago from 'timeago.js';
import timeagofr from 'timeago.js/locales/fr';

timeago.register('fr', timeagofr);

export default angular
  .module('bobib.filters', [])
  .filter('timeago', () => ts => new timeago().format(ts, 'fr')).name;
