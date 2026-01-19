const cds = require("@sap/cds")

module.exports = async (srv) => {
  const { IncentiveList } = srv.entities;
  srv.on("EmployeeDetail", async (req) => {
    return req.user;        
  });


  const api = await cds.connect.to("Tavus_API");
  srv.on("getConversation", async (req) => {
    const { replica, persona } = req.data;
    try {
      const response = await api.send({
        method: "POST",
        path: "/v2/conversations",
        headers: {
          "Content-Type": "application/json"
        },
        data: {
          replica_id: replica,
          persona_id: persona,
          custom_greeting: "Hello! I’m your virtual assistant for the Driver Incentive Management Application. How can I help you today?",
        }
      });
      return response;

      // return "https://tavus.daily.co/c13f979a3cc15440";
    } catch (error) {
      console.error(error);
      req.error(500, "Failed to create Tavus conversation");
    }
  });
}