/* eslint-disable no-undef */
/* eslint-disable jest/valid-describe */

const { assert } = require('chai');

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
			username = '0x0e4ded16'
			signup_hash = 'QsdcsdEfcZD'
			await scm.set_signup(username,signup_hash)
			const signup_hash_result = await scm.get_signup(username)
			assert.equal(signup_hash_result,signup_hash)
		})
	})

	describe('3] Matching existing usernames',async() => {
		it('Username matching is returning proper boolean values', async() =>{
			let username;
			username = '0x3e4ded16'
			false_username = '0xSeeesW3'
			signup_hash = 'QsdcsdEfcZD'
			await scm.set_signup(username, signup_hash)
			const match_result_1 = await scm.match_usernames(username)
			const match_result_2 = await scm.match_usernames(false_username)
			assert.equal(match_result_1,true)
			assert.equal(match_result_2,false)
		})
	})

	describe('4] Finding crops by farmer',async() => {
		it('Finding crops by farmer Id works', async() =>{
			let farmerId;
			farmerId = '0x3e4ded16'
			cropId = '0x43221qsde'
			crop_hash = 'QwedfeEqQt'
			cropId_1 = '0x34rfvgt'
			crop_hash_1 = 'Wqsderft'
			await scm.setFarmerCrops(farmerId, crop_hash, cropId)
			await scm.setFarmerCrops(farmerId, crop_hash_1, cropId_1)
			let crop_array = await scm.getFarmerCrops(farmerId)
			assert.lengthOf(crop_array,2)
			
		})
	})

	describe('5] Hash Datatype Storage',async() => {
		it('Hash is of type string', async() =>{
			let username;
			username = '0x0e4ded16'
			signup_hash = 'QsdcsdEfcZD'
			await scm.set_signup(username,signup_hash)
			const signup_hash_result = await scm.get_signup(username)
			assert.typeOf(signup_hash_result,'string')
		})
	})

})