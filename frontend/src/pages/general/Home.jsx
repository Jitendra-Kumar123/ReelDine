import React, { useEffect, useState } from 'react'
import axios from 'axios';
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'
import CommentModal from '../../components/CommentModal'

const Home = () => {
    const [ videos, setVideos ] = useState([])
    const [ commentModal, setCommentModal ] = useState({ isOpen: false, foodId: null, commentsCount: 0 })
    // Autoplay behavior is handled inside ReelFeed

    useEffect(() => {
        axios.get("http://localhost:3000/api/food", { withCredentials: true })
            .then(response => {

                console.log(response.data);

                setVideos(response.data.foodItems)
            })
            .catch(() => { /* noop: optionally handle error */ })
    }, [])

    // Using local refs within ReelFeed; keeping map here for dependency parity if needed

    async function likeVideo(item) {

        const response = await axios.post("http://localhost:3000/api/food/like", { foodId: item._id }, {withCredentials: true})

        if(response.data.like){
            console.log("Video liked");
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount + 1 } : v))
        }else{
            console.log("Video unliked");
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: v.likeCount - 1 } : v))
        }
        
    }

    async function saveVideo(item) {
        const response = await axios.post("http://localhost:3000/api/food/save", { foodId: item._id }, { withCredentials: true })

        if(response.data.save){
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount + 1 } : v))
        }else{
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: v.savesCount - 1 } : v))
        }
    }

    function openCommentModal(item) {
        setCommentModal({ isOpen: true, foodId: item._id, commentsCount: item.commentsCount ?? 0 })
    }

    function closeCommentModal() {
        setCommentModal({ isOpen: false, foodId: null, commentsCount: 0 })
    }

    function updateCommentsCount(newCount) {
        setVideos((prev) => prev.map((v) => v._id === commentModal.foodId ? { ...v, commentsCount: newCount } : v))
        setCommentModal((prev) => ({ ...prev, commentsCount: newCount }))
    }

    return (
        <>
            <ReelFeed
                items={videos}
                onLike={likeVideo}
                onSave={saveVideo}
                onComment={openCommentModal}
                emptyMessage="No videos available."
            />
            <CommentModal
                isOpen={commentModal.isOpen}
                onClose={closeCommentModal}
                foodId={commentModal.foodId}
                commentsCount={commentModal.commentsCount}
                onCommentsCountChange={updateCommentsCount}
            />
        </>
    )
}

export default Home