import React, { useEffect, useState } from 'react'
import '../../styles/reels.css'
import axios from 'axios'
import ReelFeed from '../../components/ReelFeed'
import CommentModal from '../../components/CommentModal'

const Saved = () => {
    const [ videos, setVideos ] = useState([])
    const [ commentModal, setCommentModal ] = useState({ isOpen: false, foodId: null, commentsCount: 0 })

    useEffect(() => {
        axios.get("http://localhost:3000/api/food/save", { withCredentials: true })
            .then(response => {
                const savedFoods = response.data.savedFoods.map((item) => ({
                    _id: item.food._id,
                    video: item.food.video,
                    description: item.food.description,
                    likeCount: item.food.likeCount,
                    savesCount: item.food.savesCount,
                    commentsCount: item.food.commentsCount,
                    foodPartner: item.food.foodPartner,
                }))
                setVideos(savedFoods)
            })
    }, [])

    const removeSaved = async (item) => {
        try {
            await axios.post("http://localhost:3000/api/food/save", { foodId: item._id }, { withCredentials: true })
            setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: Math.max(0, (v.savesCount ?? 1) - 1) } : v))
        } catch {
            // noop
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
                onSave={removeSaved}
                onComment={openCommentModal}
                emptyMessage="No saved videos yet."
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

export default Saved
