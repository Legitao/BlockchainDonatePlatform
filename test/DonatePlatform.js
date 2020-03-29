const DonatePlatform = artifacts.require('./DonatePlatform.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('DonatePlatform', ([deployer, author, donator]) => {
  let donatePlatform

  before(async () => {
    donatePlatform = await DonatePlatform.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await donatePlatform.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await donatePlatform.name()
      assert.equal(name, 'Donation Network')
    })
  })

  describe('posts', async () => {
    let result, postCount

    before(async () => {
      result = await donatePlatform.createPost('This is my first post', { from: author })
      postCount = await donatePlatform.postCount()
    })

    it('creates posts', async () => {
      // SUCESS
      assert.equal(postCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.content, 'This is my first post', 'content is correct')
      assert.equal(event.donationAmount, '0', 'donate amount is correct')
      assert.equal(event.author, author, 'author is correct')

      // FAILURE: Post must have content
      await donatePlatform.createPost('', { from: author }).should.be.rejected;
    })

    it('lists posts', async () => {
      const post = await donatePlatform.posts(postCount)
      assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(post.content, 'This is my first post', 'content is correct')
      assert.equal(post.donationAmount, '0', 'donate amount is correct')
      assert.equal(post.author, author, 'author is correct')
    })

    it('allows users to donate posts', async () => {
      // Track the author balance before purchase
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result = await donatePlatform.donatePost(postCount, { from: donator, value: web3.utils.toWei('1', 'Ether') })

      // SUCESS
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.content, 'This is my first post', 'content is correct')
      // assert.equal(event.donationAmount, "10000000000000000", 'donate amount is correct')
      assert.equal(event.author, author, 'author is correct')

      // Check that author received funds
      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let donationAmount
      donationAmount = web3.utils.toWei('1', 'Ether')
      donationAmount = new web3.utils.BN(donationAmount)

      const exepectedBalance = oldAuthorBalance.add(donationAmount)

      assert.equal(newAuthorBalance.toString(), exepectedBalance.toString())

      // FAILURE: Tries to donate a post that does not exist
      await donatePlatform.donatePost(99, { from: donator, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
    })

    it('delete posts', async () => {
      const post = await donatePlatform.posts(postCount)
      assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(post.content, 'This is my first post', 'content is correct')
      assert.equal(post.author, author, 'author is correct')
      result = await donatePlatform.deletePost(1,{ from: author })
      const event = result.logs[0].args
      const post2 = await donatePlatform.posts(1)
      assert.equal(post2.isValid,false)
      assert.equal(event.id.toNumber(), 1, 'id is correct')
      assert.equal(event.content, 'This is my first post', 'content is correct')
      assert.equal(event.author, author, 'author is correct')

    })

  })
})
