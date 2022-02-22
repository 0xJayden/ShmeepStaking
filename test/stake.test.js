import { ether, wait } from './helpers.js'

const Stake = artifacts.require('./StakeShmeeps')

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Stake', accounts => {
	const nftAddress = "0x8CE171d997d8a818D6c1437a39F344A74b068ADc"
	const tokenAddress = "0x2a47F52B0fb86e83C723C3235d3fe41e612bF351"
	let stake
	let nft
	let miniAbiNft
	let token

	beforeEach(async () => {
		stake = await Stake.new()
		miniAbiNft = [
			{
		      "inputs": [
		        {
		          "internalType": "uint256",
		          "name": "tokenId",
		          "type": "uint256"
		        }
		      ],
		      "name": "ownerOf",
		      "outputs": [
		        {
		          "internalType": "address",
		          "name": "",
		          "type": "address"
		        }
		      ],
		      "stateMutability": "view",
		      "type": "function",
		      "constant": true
		    },
		    {
		      "inputs": [
		        {
		          "internalType": "address",
		          "name": "from",
		          "type": "address"
		        },
		        {
		          "internalType": "address",
		          "name": "to",
		          "type": "address"
		        },
		        {
		          "internalType": "uint256",
		          "name": "tokenId",
		          "type": "uint256"
		        }
		      ],
		      "name": "transferFrom",
		      "outputs": [],
		      "stateMutability": "nonpayable",
		      "type": "function"
		    },
		    {
		      "inputs": [
		        {
		          "internalType": "uint256",
		          "name": "_mintAmount",
		          "type": "uint256"
		        }
		      ],
		      "name": "mint",
		      "outputs": [],
		      "stateMutability": "payable",
		      "type": "function",
		      "payable": true
		    },
		    {
		      "inputs": [
		        {
		          "internalType": "address",
		          "name": "owner",
		          "type": "address"
		        }
		      ],
		      "name": "balanceOf",
		      "outputs": [
		        {
		          "internalType": "uint256",
		          "name": "",
		          "type": "uint256"
		        }
		      ],
		      "stateMutability": "view",
		      "type": "function",
		      "constant": true
		    },
		    {
		      "inputs": [],
		      "name": "totalSupply",
		      "outputs": [
		        {
		          "internalType": "uint256",
		          "name": "",
		          "type": "uint256"
		        }
		      ],
		      "stateMutability": "view",
		      "type": "function",
		      "constant": true
		    },
		    {
		      "inputs": [
		        {
		          "internalType": "address",
		          "name": "_owner",
		          "type": "address"
		        }
		      ],
		      "name": "walletOfOwner",
		      "outputs": [
		        {
		          "internalType": "uint256[]",
		          "name": "",
		          "type": "uint256[]"
		        }
		      ],
		      "stateMutability": "view",
		      "type": "function",
		      "constant": true
		    },
		    {
		      "inputs": [
		        {
		          "internalType": "address",
		          "name": "to",
		          "type": "address"
		        },
		        {
		          "internalType": "uint256",
		          "name": "tokenId",
		          "type": "uint256"
		        }
		      ],
		      "name": "approve",
		      "outputs": [],
		      "stateMutability": "nonpayable",
		      "type": "function"
		    },
		    {
		      "inputs": [
		        {
		          "internalType": "uint256",
		          "name": "tokenId",
		          "type": "uint256"
		        }
		      ],
		      "name": "getApproved",
		      "outputs": [
		        {
		          "internalType": "address",
		          "name": "",
		          "type": "address"
		        }
		      ],
		      "stateMutability": "view",
		      "type": "function",
		      "constant": true
		    }
		]

		const miniAbiToken = [
			{
		      "inputs": [
		        {
		          "internalType": "address",
		          "name": "account",
		          "type": "address"
		        }
		      ],
		      "name": "balanceOf",
		      "outputs": [
		        {
		          "internalType": "uint256",
		          "name": "",
		          "type": "uint256"
		        }
		      ],
		      "stateMutability": "view",
		      "type": "function",
		      "constant": true
		    },
		    {
		      "inputs": [
		        {
		          "internalType": "address",
		          "name": "account",
		          "type": "address"
		        }
		      ],
		      "name": "addAdmin",
		      "outputs": [],
		      "stateMutability": "nonpayable",
		      "type": "function"
		    }
		]
		nft = await new web3.eth.Contract(miniAbiNft, nftAddress)
		token = await new web3.eth.Contract(miniAbiToken, tokenAddress)
	})

	describe('stake', () => {
		let balanceOf
		let ownerOf
		let approved
		let approve
		let result
		let admin

		beforeEach(async () => {
			await nft.methods.mint(1).send({ from: accounts[0], gas: 1000000 })
			balanceOf = await nft.methods.balanceOf(accounts[0]).call()
			console.log(balanceOf)
			ownerOf = await nft.methods.walletOfOwner(accounts[0]).call()
			console.log(ownerOf)
			approved = await nft.methods.getApproved(4).call()
			console.log(approved)
			console.log(stake.address)
			approve = await nft.methods.approve(stake.address, 4).send({ from: accounts[0], gas: 1000000 })
			approved = await nft.methods.getApproved(4).call()
			console.log(approved)
			result = await stake.stakeShmeep([4], { from: accounts[0] })
		})

		it('stakes shmeep', async () => {
			console.log(await nft.methods.ownerOf(4).call())
			console.log(stake.address)
			const log = result.logs[0]
			const event = log.args
			console.log(event)
			console.log(await stake.numShmeepsStaked())
			console.log(await token.methods.balanceOf(accounts[0]).call())
			console.log(await token.methods.balanceOf("0xD7aac94C2f596dfCa180ACF2735b43eF51B1ec2a").call())
			await token.methods.addAdmin(stake.address).send({ from: accounts[0], gas: 1000000 })
			await wait(20)
			result = await stake.claimTokens([4], true, { from: accounts[0] })
			console.log(await nft.methods.ownerOf(4).call())
			console.log(await token.methods.balanceOf(accounts[0]).call())
			console.log(await token.methods.balanceOf("0xD7aac94C2f596dfCa180ACF2735b43eF51B1ec2a").call())

		})
	})
})