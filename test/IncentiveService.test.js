const cds = require('@sap/cds')

const { GET, POST, expect, axios } = cds.test (__dirname+'/..')
axios.defaults.auth = { username: 'no_user_found_for_roles_authenticated-user', password: '' }

describe('OData APIs', () => {

  it('serves IncentiveService.IncentiveHeader', async () => {
    const { data } = await GET `/odata/v4/incentive/IncentiveService.IncentiveHeader ${{ params: { $select: 'ID,Brand' } }}`
    expect(data.value).to.containSubset([
      {"ID":"head001","Brand":"Nike"},
    ])
  })

  it('executes EmployeeDetail', async () => {
    const { data } = await POST `/odata/v4/incentive/EmployeeDetails ${
      {
          "Name":"sasank"
      }
    }`
    console.log(data)
    // TODO finish this test
    // expect(data.value).to...
  })
})
