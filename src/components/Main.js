import React, { Component, useState } from 'react';
import Identicon from 'identicon.js';
import { Collapse, Button, CardBody, Card } from 'reactstrap';


function Main(props) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  let mergedDonationInfo = props.posts.reduce((mergedDonationInfo, post, index) => {
    for (let key in post.donationInfo) {
      if (key in mergedDonationInfo) {
        mergedDonationInfo[key] += post.donationInfo[key]
      } else {
        mergedDonationInfo[key] = post.donationInfo[key]
      }
    }
    return mergedDonationInfo
  }, {})
  console.log(mergedDonationInfo)
  return (
    <div className="container-fluid mt-5">
      <div className="row justify-content-between">
        <div className="content col-6 mr-auto ml-auto">
          <p>&nbsp;</p>
          <form onSubmit={(event) => {
            event.preventDefault()
            const content = document.getElementById("postContent").value
            props.createPost(content)
          }}>
            <div className="form-group mr-sm-2">
              <textarea class="form-control" id="postContent" rows="3" placeholder="What's on your mind?" required></textarea>
            </div>
            <button type="submit" className="btn btn-primary btn-block">Post</button>
          </form>
          <p>&nbsp;</p>
          {props.posts.map((post, key) => {
            return (
              <div className="card mb-4" key={key} >
                <div className="card-header">
                  <img
                    className='mr-2'
                    width='30'
                    height='30'
                    src={`data:image/png;base64,${new Identicon(post.author, 30).toString()}`}
                  />
                  <small className="text-muted">{post.author}</small>
                </div>
                <ul id="postList" className="list-group list-group-flush">
                  <li className="list-group-item">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
                  </li>
                  <li key={key} className="list-group-item py-2">

                    <Button color="info" onClick={toggle} style={{ marginBottom: '1rem' }}>Total Donation Amount: {window.web3.utils.fromWei(post.donationAmount.toString(), 'Ether')} ETH</Button>
                    <Collapse isOpen={isOpen}>
                      <Card>
                        <CardBody>
                          <ul>
                            {Object.entries(post.donationInfo).map(([donator, donation], _index) => {
                              return <li key={_index}>{donator}, {window.web3.utils.fromWei(donation.toString(), 'Ether')}</li>
                            }
                            )}
                          </ul>
                        </CardBody>
                      </Card>
                    </Collapse>
                  </li>
                  <li className="list-group-item">

                    <div className="row">
                      <div className="col-8">
                        <div className="input-group">
                          <input type="text" id="myInput" placeHolder="amount in Ethers" className="float-left" />
                          <button
                            className="btn btn-sm btn-warning float-left pt-0"
                            name={post.id}
                            onClick={(event) => {
                              let value = document.getElementById("myInput").value;
                              let donation = window.web3.utils.toWei(value, 'Ether')
                              props.donatePost(event.target.name, donation)
                            }}
                          >
                            donate
                          </button>
                        </div>
                      </div>
                      <div className="col-4">
                        <button
                          className="btn btn-sm btn-danger float-right pt-0"
                          name={post.id}
                          onClick={(event) => {
                            console.log(event.target.name)
                            props.deletePost(event.target.name)
                            //window.location.reload();
                          }}
                        >
                          delete
                        </button>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            )
          })}
        </div>

        <div className="ranking col-5"> {
          <div className="position-fixed">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Account</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(mergedDonationInfo).map(([donator, donation], _index) => {
                  return (<tr>
                    <th scope="row">{_index}</th>
                    <td>{donator}</td>
                    <td>{window.web3.utils.fromWei(donation.toString(), 'Ether')}</td>
                  </tr>)
                }
                )}
              </tbody>
            </table>
          </div>
        }
        </div>
      </div>
    </div>
  );
}

export default Main;
