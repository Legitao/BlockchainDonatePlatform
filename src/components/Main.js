import React, { Component, useState } from 'react';
import Identicon from 'identicon.js';
import { Collapse, Button, CardBody, Card } from 'reactstrap';


function Main(props) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  let postContent;
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '500px' }}>
          <div className="content mr-auto ml-auto">
            <p>&nbsp;</p>
            <form onSubmit={(event) => {
              event.preventDefault()
              const content = postContent.value
              props.createPost(content)
            }}>
              <div className="form-group mr-sm-2">
                <input
                  id="postContent"
                  type="text"
                  ref={(input) => { postContent = input }}
                  className="form-control"
                  placeholder="What's on your mind?"
                  required />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Share</button>
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
                      <p>{post.content}</p>
                    </li>
                    <li key={key} className="list-group-item py-2">
                      {/* <small className="float-left mt-1 text-muted">
                          TIPS: {window.web3.utils.fromWei(post.tipAmount.toString(), 'Ether')} ETH
                        </small> */}
                        <Button color="primary" onClick={toggle} style={{ marginBottom: '1rem' }}>TIPS: {window.web3.utils.fromWei(post.tipAmount.toString(), 'Ether')} ETH</Button>
                        <Collapse isOpen={isOpen}>
                          <Card>
                            <CardBody>
                              <ul>
                                {post.tippers.map((tipper, _index) => (
                                  <li key={_index}>{tipper}</li>
                                ))}
                              </ul>
                            </CardBody>
                          </Card>
                        </Collapse>
                        <button
                        className="btn btn-link btn-sm float-right pt-0"
                        name={post.id}
                        onClick={(event) => {
                          let tipAmount = window.web3.utils.toWei('0.1', 'Ether')
                          console.log(event.target.name, tipAmount)
                          props.tipPost(event.target.name, tipAmount)
                        }}
                      >
                        TIP 0.1 ETH
                        </button>

                    </li>
                    <li className="list-group-item">
                      <button
                        className="btn btn-link btn-sm float-right pt-0"
                        name={post.id}
                        onClick={(event) => {
                          console.log(event.target.name)
                          props.deletePost(event.target.name)
                          //window.location.reload();
                        }}
                      >
                        delete
                        </button>
                    </li>
                  </ul>
                </div>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Main;
