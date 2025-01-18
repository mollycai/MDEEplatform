import hasRole from './permission/hasRole';
import hasPerm from './permission/hasPerm';

export default function directive(app) {
  app.directive('roles', hasRole);
  app.directive('perms', hasPerm);
}
