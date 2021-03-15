/* eslint-disable no-undef */
/* eslint-disable jest/valid-describe */
// eslint-disable-next-line no-undef
const Scm = artifacts.require("Scm");

require('chai')
	.use(require('chai-as-promised'))
	.should()


contract('Scm',(accounts) => {
	let scm;

	before(async () => {
		scm = await Scm.deployed()
	})

	describe('1] Checking Scm contract deployment',async() => {
		it('Scm contract deployed correctly', async() => {
			const address = scm.address
			assert.notEqual(address,0x0)
			assert.notEqual(address,'')
			assert.notEqual(address,null)
			assert.notEqual(address,undefined)
		})
	})

	describe('2] Signup hash storage',async() => {
		it('Adds and fetches the signup hash correctly', async() =>{
			let username;
			username = 'abc'
			signup_hash = '0x0e4ded16'
			await scm.set_signup(username,signup_hash)
			const signup_hash_result = await scm.get_signup(username)
			assert.equal(signup_hash_result,signup_hash)
		})
	})

})