const MILESTONES = [1, 5, 10, 25, 50, 100, 250, 500, 100];

export const isLikeMilestone = (likesCount) => {
    return MILESTONES.includes(likesCount);
};