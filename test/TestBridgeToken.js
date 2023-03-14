var BridgeToken = artifacts.require("BridgeToken");

contract("BridgeToken", async accounts => {
    it("mint one bridge token", async () => {
        let instance = await BridgeToken.deployed();
        let product = {id: "1234abcd", platform: "amazon", url: "http://testurl"};
        let tokenid = await instance.getBridgeTokenID(product)
        let mintlist = [{product: product, amount: 9, to: accounts[1]}];
        await instance.batchMint(mintlist);
        assert.equal((await instance.balanceOf(instance.address, tokenid)).toString(), "0", "balance of instance.address error");
        assert.equal((await instance.balanceOf(accounts[0], tokenid)).toString(), "0", "balance of accounts[0] error");
        assert.equal((await instance.balanceOf(accounts[1], tokenid)).toString(), "9", "balance of accounts[1] error");
        assert.equal((await instance.uri(tokenid)), "http://testurl", "token uri error");
    });
    it("mint multi bridge token", async () => {
        let instance = await BridgeToken.deployed();
        let product2 = {id: "2221abcd", platform: "amazon", url: "http://testurl2"};
        let tokenid2 = await instance.getBridgeTokenID(product2)
        let product3 = {id: "3332abcd", platform: "amazon", url: "http://testurl3"};
        let tokenid3 = await instance.getBridgeTokenID(product3)
        let mintlist = [{product: product2, amount: 5, to: accounts[2]},{product: product3, amount: 7, to: accounts[3]}];
        await instance.batchMint(mintlist);
        assert.equal((await instance.balanceOf(accounts[2], tokenid2)).toString(), "5", "balance of accounts[2] error");
        assert.equal((await instance.balanceOf(accounts[3], tokenid3)).toString(), "7", "balance of accounts[3] error");
        assert.equal((await instance.uri(tokenid3)), "http://testurl3", "token uri error");
    });
    it("burn one bridge token", async () => {
        let instance = await BridgeToken.deployed();
        let product = {id: "1234abcd", platform: "amazon", url: "http://testurl"};
        let tokenid = await instance.getBridgeTokenID(product);
        // before accounts[1]-tokenid 9
        await instance.safeTransferFrom(accounts[1], instance.address, tokenid, 3, "0x", {from: accounts[1]});
        assert.equal((await instance.balanceOf(accounts[1], tokenid)).toString(), "6", "balance of accounts[1] error");
        // instance.address-tokenid is burned
        assert.equal((await instance.balanceOf(instance.address, tokenid)).toString(), "0", "balance of instance.address error");
    });
    it("burn multi bridge token", async () => {
        let instance = await BridgeToken.deployed();
        let product2 = {id: "2221abcd", platform: "amazon", url: "http://testurl2"};
        let tokenid2 = await instance.getBridgeTokenID(product2)
        let product3 = {id: "3332abcd", platform: "amazon", url: "http://testurl3"};
        let tokenid3 = await instance.getBridgeTokenID(product3)
        // before accounts[2]-tokenid2 5
        // before accounts[3]-tokenid3 7
        await instance.safeTransferFrom(accounts[3], accounts[2], tokenid3, 2, "0x", {from: accounts[3]});
        // before accounts[2]-tokenid2 5
        // before accounts[2]-tokenid3 2
        // before accounts[3]-tokenid3 5
        await instance.safeBatchTransferFrom(accounts[2], instance.address, [tokenid2,tokenid3], [2,1], "0x", {from: accounts[2]});
        await instance.safeBatchTransferFrom(accounts[3], instance.address, [tokenid2,tokenid3], [0,1], "0x", {from: accounts[3]});
        await instance.safeBatchTransferFrom(accounts[3], instance.address, [tokenid3], [2], "0x", {from: accounts[3]});
        assert.equal((await instance.balanceOf(accounts[2], tokenid2)).toString(), "3", "balance of accounts[2] token2 error");
        assert.equal((await instance.balanceOf(accounts[2], tokenid3)).toString(), "1", "balance of accounts[2] token3 error");
        assert.equal((await instance.balanceOf(accounts[3], tokenid2)).toString(), "0", "balance of accounts[3] token2 error");
        assert.equal((await instance.balanceOf(accounts[3], tokenid3)).toString(), "2", "balance of accounts[3] token3 error");
        assert.equal((await instance.balanceOf(instance.address, tokenid2)).toString(), "0", "balance of instance.address token2 error");
        assert.equal((await instance.balanceOf(instance.address, tokenid3)).toString(), "0", "balance of instance.address token3 error");
    });
})