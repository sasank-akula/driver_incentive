const cds=require("@sap/cds")

module.exports=(srv)=>{
    const { IncentiveList }  = srv.entities;
    srv.on("READ", "IncentiveList", async (req) => {
        const user = req.user;
        if (!user || !user.id) {
            return req.reject(401, "Unauthorized");
        }
        if(user.is('incentiveAdmin')){
            return await cds.run(req.query);
        }
        else if(user.is('incentiveDriver')){
            req.query.where({ email: user.attr.email });
            return await cds.run(req.query);
        }
        else{
            return req.reject(403,"Insuffient permissions")
        }
    });
    srv.on("userdetails", async(req)=>{
        return req.user;
    })
}