using com.cy.driver as cy from '../db/schema';

@(requires: 'authenticated-user')
service IncentiveService {
  //    @restrict: [
  //   { grant: '*', to: 'incentiveAdmin' },
  //   { grant: '*', to: 'incentiveDriver', where: 'email = $user.email' }
  // ]
  entity IncentiveHeader  as projection on cy.IncentiveHeader;
  entity IncentiveDetails as projection on cy.IncentiveDetails;
  entity IncentiveSummary as projection on cy.IncentiveSummary;
  entity EmployeeDetails  as projection on cy.EmployeeDetails;
  entity Brand            as projection on cy.Brand;
  entity Location         as projection on cy.Location;
  entity IncentiveType    as projection on cy.IncentiveType;
  function getConversation(replica: String, persona: String) returns String;

  function EmployeeDetail()   returns String;
}
