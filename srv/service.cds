using com.cy.driver as cy from '../db/schema';


service IncentiveService {
    entity IncentiveList as projection on cy.IncentiveList;
}