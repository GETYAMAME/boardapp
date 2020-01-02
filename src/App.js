import React, { Component } from 'react';
import { API, graphqlOperation } from "aws-amplify";
import { listPosts } from './graphql/queries';
import { createPost } from './graphql/mutations';
import { onCreatePost } from './graphql/subscriptions';
import { withAuthenticator } from "aws-amplify-react";

class App extends Component {

  state = {
    posts: [],
    title: "",
    content: ""
  }

  async componentDidMount() {
    try {
      const posts = await API.graphql(graphqlOperation(listPosts))
      console.log('posts: ', posts)
      this.setState({ posts: posts.data.listPosts.items })
    } catch (e) {
      console.log(e)
    }

    API.graphql(graphqlOperation(onCreatePost)).subscribe({
      next: (eventData) => {
        console.log('eventData: ', eventData)
        const post = eventData.value.data.onCreatePost
        const posts = [...this.state.posts.filter(content => {
          return (content.title !== post.title)
        }), post]
        this.setState({ posts })
      }
    })
  }

 createPost = async () => {
    // バリデーションチェック
    if (this.state.title === '' || this.state.content === '') return
    // 新規登録 mutation
    const createPostInput = {
      title: this.state.title,
      content: this.state.content
    }

    // 登録処理
    try {
      const posts = [...this.state.posts, createPostInput]
      this.setState({ posts: posts, title: "", content: "" })
      await API.graphql(graphqlOperation(createPost, { input: createPostInput }))
      console.log('createPostInput: ', createPostInput)
    } catch (e) {
      console.log(e)
    }
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render (){
    return (
      <div className="App">
        <div>
          title
          <input value={this.state.title} name="title" onChange={this.onChange}></input>
        </div>
        <div>
          content
          <input value={this.state.content} name="content" onChange={this.onChange}></input>
        </div>
        <button onClick={this.createPost}>submit</button>
        // ↓この行を追加
        {this.state.posts.map((post,idx) => {return <div key={idx}><div>title: {post.title}</div><div>content:, {post.content}</div></div>})}
      </div>
    );
  }

}

//export default App;
export default withAuthenticator(App, {includeGreeting: true});
