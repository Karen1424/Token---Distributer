const Distributer = artifacts.require("Distributer");

contract("Distributer", (accounts) => {
    let distributer;

    beforeEach("Deploye contract", async () => {
        distributer = await Distributer.deployed();
    });
    const founder = accounts[3];
    const amount = 10000;
    it("Add Founders", async () => {
        await distributer.addFounder(founder,amount);
        console.log("Founder added");
    });

    it("Add Employee", async () => {
       const emp =  await distributer.addEmployee(accounts[4],50000);
        console.log("Employee added",emp);
    });
  
    it("sold Tokens Management", async () => {
       await distributer.soldTokensManagement(accounts[3],1000);
       
    });
    //console.log("Memeory");
    //it("Claim", async () => {
    //    const status = await distributer.claim({from : accounts[3]});
    //}); 
    console.log("Storage");
    it("Claims", async () => {
        const status = await distributer.claims({from : accounts[3]});
    }); 
    
});