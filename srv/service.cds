using com.cy.driver as cy from '../db/schema';

@(requires: 'authenticated-user')
service IncentiveService {
    entity IncentiveList as projection on cy.IncentiveList;
    function userdetails() returns String;
}