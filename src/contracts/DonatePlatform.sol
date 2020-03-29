pragma solidity ^0.5.0;

contract DonatePlatform {
    string public name;
    uint public postCount = 0;
    mapping(uint => Post) public posts;

    struct Post {
        uint id;
        string content;
        uint donationAmount;
        address payable author;
        bool isValid;
        address[] donators; //the "free" getter you're using doesn't support the indexed value so it just leaves it out
    }

    event PostCreated(
        uint id,
        string content,
        uint donationAmount,
        address payable author
    );

    event PostDonated(
        uint id,
        string content,
        uint donationAmount,
        address payable author
    );

    event PostDeleted(
        uint id,
        string content,
        uint donationAmount,
        address payable author
    );

    constructor() public {
        name = "Donation Network";
    }

    function getPostTippers(uint256 _id) public returns (address[] memory) {
        return posts[_id].donators;
    }

    function createPost(string memory _content) public {
        // Require valid content
        require(bytes(_content).length > 0);
        // Increment the post count
        postCount ++;
        // Create the post
        posts[postCount] = Post(postCount, _content, 0, msg.sender, true, new address[](0));
        // Trigger event
        emit PostCreated(postCount, _content, 0, msg.sender);
    }

    function donatePost(uint _id) public payable {
        // Make sure the id is valid
        require(_id > 0 && _id <= postCount);
        // Fetch the post
        Post memory _post = posts[_id];
        // Fetch the author
        address payable _author = _post.author;
        // Pay the author by sending them Ether
        address(_author).transfer(msg.value);
        // // Incremet the donate amount
        // _post.donationAmount = _post.donationAmount + msg.value;
        // _post.donator.push(msg.sender);
        // // Update the post
        // posts[_id] = _post;
        posts[_id].donationAmount = _post.donationAmount + msg.value;
        posts[_id].donators.push(msg.sender);
        // Trigger an event
        emit PostDonated(postCount, _post.content, _post.donationAmount, _author);
    }

    function deletePost(uint _id) public {
        // Make sure the id is valid
        require(_id > 0 && _id <= postCount);
        // Fetch the post
        Post memory _post = posts[_id];
        // Fetch the author
        address payable _author = _post.author;
        // Make sure the author himself is deleting the post
        require(msg.sender == _author);
        _post.isValid = false;
        posts[_id] = _post;
        emit PostDeleted(_id, _post.content, _post.donationAmount, _author);
    }
}
