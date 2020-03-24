pragma solidity ^0.5.0;

contract SocialNetwork {
    string public name;
    uint public postCount = 0;
    mapping(uint => Post) public posts;

    struct Post {
        uint id;
        string content;
        uint tipAmount;
        address payable author;
        bool isValid;
        address[] tippers; //the "free" getter you're using doesn't support the indexed value so it just leaves it out
    }

    event PostCreated(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    event PostTipped(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    event PostDeleted(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    constructor() public {
        name = "Dapp University Social Network";
    }

    function getPostTippers(uint256 _id) public returns (address[] memory) {
        return posts[_id].tippers;
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

    function tipPost(uint _id) public payable {
        // Make sure the id is valid
        require(_id > 0 && _id <= postCount);
        // Fetch the post
        Post memory _post = posts[_id];
        // Fetch the author
        address payable _author = _post.author;
        // Pay the author by sending them Ether
        address(_author).transfer(msg.value);
        // // Incremet the tip amount
        // _post.tipAmount = _post.tipAmount + msg.value;
        // _post.tippers.push(msg.sender);
        // // Update the post
        // posts[_id] = _post;
        posts[_id].tipAmount = _post.tipAmount + msg.value;
        posts[_id].tippers.push(msg.sender);
        // Trigger an event
        emit PostTipped(postCount, _post.content, _post.tipAmount, _author);
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
        emit PostDeleted(postCount, _post.content, _post.tipAmount, _author);
    }
}
