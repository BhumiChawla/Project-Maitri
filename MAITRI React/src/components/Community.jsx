import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'

const Community = () => {
  // Static default posts (as fallback)
  const defaultPosts = [
    {
      id: 1,
      author: 'Meera S.',
      avatar: 'MS',
      time: '2 hours ago',
      category: 'Home Remedies',
      title: 'Natural remedy for period cramps that actually works!',
      content: 'I\'ve been using this ginger and turmeric tea recipe for months and it really helps with period pain. Boil water with fresh ginger slices, add turmeric powder and honey. Drink it twice a day during your period.',
      likes: 24,
      comments: 8,
      tags: ['period-pain', 'natural-remedies', 'ginger']
    },
    {
      id: 2,
      author: 'Anonymous',
      avatar: 'A',
      time: '5 hours ago',
      category: 'Support',
      title: 'Dealing with PCOS - feeling overwhelmed',
      content: 'Just got diagnosed with PCOS and I\'m feeling scared and confused. Has anyone here dealt with this? What lifestyle changes helped you the most?',
      likes: 18,
      comments: 15,
      tags: ['pcos', 'support', 'lifestyle']
    },
    {
      id: 3,
      author: 'Meera K.',
      avatar: 'MK',
      time: '1 day ago',
      category: 'Wellness Tips',
      title: 'My morning routine for better energy',
      content: 'After struggling with fatigue for months, I found this routine really helps: 1) Drink warm lemon water 2) 10 minutes of yoga 3) Protein-rich breakfast 4) 5 minutes of meditation. Game changer!',
      likes: 32,
      comments: 12,
      tags: ['energy', 'morning-routine', 'wellness']
    },
    {
      id: 4,
      author: 'Kavya R.',
      avatar: 'KR',
      time: '2 days ago',
      category: 'Nutrition',
      title: 'Iron-rich recipes that are actually tasty',
      content: 'Struggling with low iron levels? Try these recipes: spinach and chickpea curry, beetroot and pomegranate salad, and my grandmother\'s ragi porridge recipe. All delicious and iron-packed!',
      likes: 27,
      comments: 9,
      tags: ['iron-deficiency', 'recipes', 'nutrition']
    }
  ]

  const { user } = useUser()
  const [posts, setPosts] = useState(defaultPosts)

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    isAnonymous: false
  })

  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [openDropdown, setOpenDropdown] = useState(null)
  const [showComments, setShowComments] = useState({})
  const [commentText, setCommentText] = useState({})
  const [postComments, setPostComments] = useState({})
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [loading, setLoading] = useState(false)

  const categories = ['All', 'Home Remedies', 'Support', 'Wellness Tips', 'Nutrition', 'Mental Health', 'Exercise']

  // Load posts on component mount
  useEffect(() => {
    loadPosts()
  }, [])

  // API Functions
  const loadPosts = async () => {
    try {
      setLoading(true)
      const userId = user?.id || 1
      const response = await fetch(`http://localhost:8080/api/community/posts?userId=${userId}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.posts.length > 0) {
          setPosts(result.posts)
        }
        // If no posts from API, keep default posts
      } else {
        console.log('Failed to load posts from API, using default posts')
      }
    } catch (error) {
      console.log('Error loading posts:', error)
      // Keep default posts on error
    } finally {
      setLoading(false)
    }
  }

  const apiCall = async (url, method = 'GET', body = null) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const userId = user?.id || 1
    const userName = user?.name || 'User'
    
    // Add user info to URL for API calls
    const urlWithParams = new URL(url)
    urlWithParams.searchParams.append('userId', userId)
    urlWithParams.searchParams.append('userName', userName)
    
    return fetch(urlWithParams.toString(), options)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown !== null && !event.target.closest('.position-relative')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [openDropdown])

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory)

  const handleNewPost = async (e) => {
    e.preventDefault()
    if (newPost.title.trim() && newPost.content.trim() && newPost.category) {
      try {
        setLoading(true)
        const response = await apiCall('http://localhost:8080/api/community/posts', 'POST', {
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          isAnonymous: newPost.isAnonymous
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            // Add the new post to the top of the list
            setPosts([result.post, ...posts])
            setNewPost({ title: '', content: '', category: '', isAnonymous: false })
            setShowNewPostForm(false)
          } else {
            alert('Failed to create post: ' + result.message)
          }
        } else {
          const errorResult = await response.json()
          alert('Failed to create post: ' + (errorResult.message || 'Server error'))
        }
      } catch (error) {
        console.error('Error creating post:', error)
        alert('Failed to create post. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleLike = async (postId) => {
    try {
      const response = await apiCall(`http://localhost:8080/api/community/posts/${postId}/like`, 'POST')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Update the post in local state
          setPosts(posts.map(post => 
            post.id === postId 
              ? { ...post, likes: result.post.likes, isLikedByUser: result.post.isLikedByUser }
              : post
          ))
          
          // Update liked posts set
          if (result.post.isLikedByUser) {
            setLikedPosts(prev => new Set([...prev, postId]))
          } else {
            setLikedPosts(prev => {
              const newSet = new Set(prev)
              newSet.delete(postId)
              return newSet
            })
          }
        }
      } else {
        console.error('Failed to toggle like')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await apiCall(`http://localhost:8080/api/community/posts/${postId}`, 'DELETE')
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setPosts(posts.filter(post => post.id !== postId))
          } else {
            alert('Failed to delete post: ' + result.message)
          }
        } else {
          const errorResult = await response.json()
          alert('Failed to delete post: ' + (errorResult.message || 'Server error'))
        }
      } catch (error) {
        console.error('Error deleting post:', error)
        alert('Failed to delete post. Please try again.')
      }
    }
  }

  const toggleDropdown = (postId) => {
    setOpenDropdown(openDropdown === postId ? null : postId)
  }

  const handleReport = (postId) => {
    alert(`Post reported. Thank you for helping keep our community safe!`)
    setOpenDropdown(null)
  }

  const handleSave = (postId) => {
    alert(`Post saved to your bookmarks!`)
    setOpenDropdown(null)
  }

  const handleComment = async (postId) => {
    const isOpening = !showComments[postId]
    
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
    
    // Load comments when opening for the first time
    if (isOpening && !postComments[postId]) {
      try {
        const userId = user?.id || 1
        const response = await fetch(`http://localhost:8080/api/community/posts/${postId}/comments?userId=${userId}`)
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setPostComments(prev => ({
              ...prev,
              [postId]: result.comments || []
            }))
          }
        }
      } catch (error) {
        console.error('Error loading comments:', error)
      }
    }
  }

  const handleShare = (postId) => {
    const post = posts.find(p => p.id === postId)
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href
      }).catch(console.error)
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${post.title}\n\n${post.content}\n\nShared from Maitri Community: ${window.location.href}`)
        .then(() => alert('Post copied to clipboard!'))
        .catch(() => alert('Unable to share. Please copy the URL manually.'))
    }
  }

  const handlePostComment = async (postId) => {
    const comment = commentText[postId]?.trim()
    if (comment) {
      try {
        const response = await apiCall(`http://localhost:8080/api/community/posts/${postId}/comments`, 'POST', {
          content: comment
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            // Add the new comment to the post's comment list
            setPostComments(prev => ({
              ...prev,
              [postId]: [...(prev[postId] || []), result.comment]
            }))
            
            // Update the comments count for the post
            setPosts(posts.map(post => 
              post.id === postId 
                ? { ...post, comments: post.comments + 1 }
                : post
            ))
            
            // Clear the comment text
            setCommentText(prev => ({
              ...prev,
              [postId]: ''
            }))
          } else {
            alert('Failed to post comment: ' + result.message)
          }
        } else {
          const errorResult = await response.json()
          alert('Failed to post comment: ' + (errorResult.message || 'Server error'))
        }
      } catch (error) {
        console.error('Error posting comment:', error)
        alert('Failed to post comment. Please try again.')
      }
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Home Remedies': 'success',
      'Support': 'primary',
      'Wellness Tips': 'info',
      'Nutrition': 'warning',
      'Mental Health': 'secondary',
      'Exercise': 'danger'
    }
    return colors[category] || 'primary'
  }

  return (
    <>
      {/* Header Section */}
      <section className="hero-section community-hero">
        <div className="container-fluid">
          <div className="text-center" style={{paddingTop: '40px'}}>
            <h1 className="display-4 fw-bold mb-4">Women's <span className="text-pink">Community</span></h1>
            <p className="lead">Share experiences and home remedies with other women</p>
          </div>
        </div>
      </section>

      {/* Community Features */}
      <section className="py-3 bg-light">
        <div className="container-fluid">
          <div className="row g-3">
            <div className="col-md-3 text-center">
              <i className="fas fa-users text-pink"></i>
              <small className="ms-2">Safe Community</small>
            </div>
            <div className="col-md-3 text-center">
              <i className="fas fa-user-secret text-pink"></i>
              <small className="ms-2">Anonymous Posting</small>
            </div>
            <div className="col-md-3 text-center">
              <i className="fas fa-heart text-pink"></i>
              <small className="ms-2">Peer Support</small>
            </div>
            <div className="col-md-3 text-center">
              <i className="fas fa-leaf text-pink"></i>
              <small className="ms-2">Natural Remedies</small>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-5">
        <div className="container-fluid">
          <div className="row">
            {/* Sidebar */}
            <div className="col-lg-3 mb-4">
              <div className="community-sidebar">
                {/* New Post Button */}
                <button 
                  className="btn btn-primary w-100 mb-4"
                  onClick={() => setShowNewPostForm(true)}
                >
                  <i className="fas fa-plus me-2"></i>
                  Share Your Story
                </button>

                {/* Categories */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Categories</h6>
                  </div>
                  <div className="card-body p-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        className={`btn btn-sm w-100 mb-2 ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Community Guidelines */}
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">Community Guidelines</h6>
                  </div>
                  <div className="card-body">
                    <ul className="list-unstyled small">
                      <li className="mb-2">
                        <i className="fas fa-check text-success me-2"></i>
                        Be respectful and supportive
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-check text-success me-2"></i>
                        Share evidence-based information
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-check text-success me-2"></i>
                        Respect privacy and anonymity
                      </li>
                      <li className="mb-0">
                        <i className="fas fa-check text-success me-2"></i>
                        Consult professionals for medical advice
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="col-lg-9">
              {/* New Post Form Modal */}
              {showNewPostForm && (
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Share Your Story</h6>
                    <button 
                      className="btn-close"
                      onClick={() => setShowNewPostForm(false)}
                    ></button>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleNewPost}>
                      <div className="mb-3">
                        <label className="form-label">Category</label>
                        <select 
                          className="form-select"
                          value={newPost.category}
                          onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                          required
                        >
                          <option value="">Select category</option>
                          {categories.slice(1).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input 
                          type="text"
                          className="form-control"
                          value={newPost.title}
                          onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                          placeholder="Give your post a descriptive title"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Content</label>
                        <textarea 
                          className="form-control"
                          rows="4"
                          value={newPost.content}
                          onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                          placeholder="Share your experience, tips, or questions..."
                          required
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <div className="form-check">
                          <input 
                            className="form-check-input"
                            type="checkbox"
                            checked={newPost.isAnonymous}
                            onChange={(e) => setNewPost({...newPost, isAnonymous: e.target.checked})}
                          />
                          <label className="form-check-label">
                            Post anonymously
                          </label>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary">
                          <i className="fas fa-paper-plane me-2"></i>
                          Share Post
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary"
                          onClick={() => setShowNewPostForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Posts */}
              <div className="posts-container">
                {filteredPosts.map(post => (
                  <div key={post.id} className="card mb-4 post-card">
                    <div className="card-body">
                      {/* Post Header */}
                      <div className="d-flex align-items-center mb-3">
                        <div className="avatar-circle me-3">
                          {post.avatar}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center">
                            <h6 className="mb-0 me-2">{post.author}</h6>
                            <span className={`badge bg-${getCategoryColor(post.category)}`}>
                              {post.category}
                            </span>
                          </div>
                          <small className="text-muted">{post.time}</small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          {(post.author === 'You' || post.isOwnPost) && (
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(post.id)}
                              title="Delete post"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                          <div className="position-relative">
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => toggleDropdown(post.id)}
                            >
                              <i className="fas fa-ellipsis-h"></i>
                            </button>
                            {openDropdown === post.id && (
                              <div className="dropdown-menu show position-absolute" style={{right: 0, top: '100%', zIndex: 1000}}>
                                <button 
                                  className="dropdown-item" 
                                  onClick={() => handleReport(post.id)}
                                >
                                  <i className="fas fa-flag me-2"></i>Report
                                </button>
                                <button 
                                  className="dropdown-item" 
                                  onClick={() => handleSave(post.id)}
                                >
                                  <i className="fas fa-bookmark me-2"></i>Save
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <h5 className="post-title">{post.title}</h5>
                      <p className="post-content">{post.content}</p>

                      {/* Post Tags */}
                      {post.tags.length > 0 && (
                        <div className="mb-3">
                          {post.tags.map(tag => (
                            <span key={tag} className="badge bg-light text-dark me-2">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex gap-3">
                          <button 
                            className={`btn btn-sm ${likedPosts.has(post.id) ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleLike(post.id)}
                          >
                            <i className={`fas fa-heart me-1 ${likedPosts.has(post.id) ? 'text-white' : ''}`}></i>
                            {post.likes}
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleComment(post.id)}
                          >
                            <i className="fas fa-comment me-1"></i>
                            {post.comments}
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleShare(post.id)}
                          >
                            <i className="fas fa-share me-1"></i>
                            Share
                          </button>
                        </div>
                        <button className="btn btn-sm btn-outline-secondary">
                          <i className="fas fa-bookmark"></i>
                        </button>
                      </div>

                      {/* Comments Section */}
                      {showComments[post.id] && (
                        <div className="mt-3 pt-3 border-top">
                          <h6 className="mb-3">Comments</h6>
                          <div className="mb-3">
                            <div className="d-flex mb-2">
                              <div className="avatar-circle me-2" style={{width: '32px', height: '32px', fontSize: '0.8rem'}}>
                                U
                              </div>
                              <div className="flex-grow-1">
                                <textarea 
                                  className="form-control form-control-sm" 
                                  rows="2" 
                                  placeholder="Write a comment..."
                                  value={commentText[post.id] || ''}
                                  onChange={(e) => setCommentText(prev => ({
                                    ...prev,
                                    [post.id]: e.target.value
                                  }))}
                                ></textarea>
                              </div>
                            </div>
                            <div className="text-end">
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => handlePostComment(post.id)}
                                disabled={!commentText[post.id]?.trim()}
                              >
                                <i className="fas fa-paper-plane me-1"></i>
                                Comment
                              </button>
                            </div>
                          </div>
                          <div className="comments-list">
                            {/* User's new comments */}
                            {postComments[post.id]?.map(comment => (
                              <div key={comment.id} className="d-flex mb-2">
                                <div className="avatar-circle me-2" style={{width: '32px', height: '32px', fontSize: '0.8rem'}}>
                                  {comment.avatar}
                                </div>
                                <div className="flex-grow-1">
                                  <div className="bg-light p-2 rounded">
                                    <small className="fw-bold">{comment.author}</small>
                                    <p className="mb-0 small">{comment.content}</p>
                                  </div>
                                  <small className="text-muted">{comment.time}</small>
                                </div>
                              </div>
                            ))}
                            
                            {/* Existing sample comments */}
                            <div className="d-flex mb-2">
                              <div className="avatar-circle me-2" style={{width: '32px', height: '32px', fontSize: '0.8rem'}}>
                                JS
                              </div>
                              <div className="flex-grow-1">
                                <div className="bg-light p-2 rounded">
                                  <small className="fw-bold">Jane S.</small>
                                  <p className="mb-0 small">Thank you for sharing this! I'll definitely try it.</p>
                                </div>
                                <small className="text-muted">2 minutes ago</small>
                              </div>
                            </div>
                            <div className="d-flex mb-2">
                              <div className="avatar-circle me-2" style={{width: '32px', height: '32px', fontSize: '0.8rem'}}>
                                A
                              </div>
                              <div className="flex-grow-1">
                                <div className="bg-light p-2 rounded">
                                  <small className="fw-bold">Anonymous</small>
                                  <p className="mb-0 small">This really helped me too. Natural remedies are the best!</p>
                                </div>
                                <small className="text-muted">5 minutes ago</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-5">
                  <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                  <h4>No posts in this category yet</h4>
                  <p className="text-muted">Be the first to share something!</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowNewPostForm(true)}
                  >
                    Create First Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Community
