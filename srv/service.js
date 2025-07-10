const cds=require("@sap/cds")

module.exports=(srv)=>{
    const { IncentiveList }  = srv.entities;
    srv.on("userdetails", async(req)=>{
        return req.user;
    })
}