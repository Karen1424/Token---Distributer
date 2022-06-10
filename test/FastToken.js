const FastToken = artifacts.require("FastToken");

contract("Fast Token", async () => {

    let fastToken;
    describe("Checking basic properties", async () => {

        before(async () => {

            fastToken = await FastToken.deployed();
        });

        after(async () => {

        });

        it("Get name", async () => {

            let name = await fastToken.name();
            assert(name == "Fast Token", "wrong name");
            console.log(name);
        });

        it("Get symbol", async () => {

            let symbol = await fastToken.symbol();
            assert(symbol == "FT", "wrong symbol");
            console.log(symbol);
        });
    });
});
