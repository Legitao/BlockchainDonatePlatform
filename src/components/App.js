import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import DonatePlatform from '../abis/DonatePlatform.json'
//How does this import work
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account( the current metamask account)
    // Array(1)
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = DonatePlatform.networks[networkId]
    if(networkData) {
      const donatePlatform = new web3.eth.Contract(DonatePlatform.abi, networkData.address)
      this.setState({ donatePlatform })
      const postCount = await donatePlatform.methods.postCount().call()
      this.setState({ postCount })
      // Load Posts
      for (var i = 1; i <= postCount; i++) {
        const post = await donatePlatform.methods.posts(i).call()
        console.log(post)
        if(post.isValid) {
          //can't access donators directly from post.donators
          //Because array doesn't have free getter from solidity
          let donators = await donatePlatform.methods.getPostDonators(i).call()
          let donations = await donatePlatform.methods.getPostDonations(i).call() //array of strings
          let donationInfo = donators.reduce((donationObject, donator, index) => {
            console.log(index, donator ,donationObject)
            if(donator in donationObject) {
              donationObject[donator] += parseInt(donations[index]);
            } else {
              donationObject[donator] = parseInt(donations[index]);
            }
            return donationObject
          }, {})
          post.donationInfo = donationInfo
          this.setState({
            posts: [...this.state.posts, post]
          })
        }
      }
      // Sort posts. Show highest donateped posts first
      this.setState({
        posts: this.state.posts.sort((a,b) => b.donateAmount - a.donateAmount )
      })
      this.setState({ loading: false})
    } else {
      window.alert('DonatePlatform contract not deployed to detected network.')
    }
  }

  createPost(content) {
    this.setState({ loading: true })
    this.state.donatePlatform.methods.createPost(content).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
      // ??why the page doesn't show updated content without reloading
      window.location.reload()
    })
  }

  donatePost(id, donation) {
    this.setState({ loading: true })
    this.state.donatePlatform.methods.donatePost(id).send({ from: this.state.account, value: donation })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  deletePost(id) {
    this.setState({ loading: true })
    this.state.donatePlatform.methods.deletePost(id).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      donatePlatform: null,
      postCount: 0,
      posts: [],
      loading: true
    }

    this.createPost = this.createPost.bind(this)
    this.donatePost = this.donatePost.bind(this)
    this.deletePost = this.deletePost.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              posts={this.state.posts}
              createPost={this.createPost}
              donatePost={this.donatePost}
              deletePost={this.deletePost}
            />
        }
      </div>
    );
  }
}

export default App;
