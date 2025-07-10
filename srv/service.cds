using com.cy.driver as cy from '../db/schema';

@(requires: 'authenticated-user')
service IncentiveService {
     @restrict: [
    { grant: '*', to: 'incentiveAdmin' },
    { grant: '*', to: 'incentiveDriver', where: 'email = $user.email' }
  ]
    entity IncentiveList as projection on cy.IncentiveList;
    function userdetails() returns String;
}