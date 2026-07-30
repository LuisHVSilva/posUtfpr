const userBase = "auth";
const fileUrlBase = "media";
const identityBase = "identity";

export const AuthUrl = {
    login: `/${userBase}/login`,
    registerUser: `/${userBase}/register`,
}

export const FileUrl = {
    uploadBatch: `/${fileUrlBase}/upload-batch`,
    feed: `/${fileUrlBase}/feed`,
    tags: `/${fileUrlBase}/tags`,
    feedUpdates: `/${fileUrlBase}/feed-updates`,
    like: `/${fileUrlBase}/like`,
    comment: `/${fileUrlBase}/comment`,
    comments: (mediaId: number) => `/${fileUrlBase}/${mediaId}/comments`,
    download: (mediaId: number) => `/${fileUrlBase}/${mediaId}/download`,
    feedImage: (mediaId: number) => `/${fileUrlBase}/${mediaId}/feed-image`,
    reportUnavailable: (mediaId: number) => `/${fileUrlBase}/${mediaId}/report-unavailable`,
    feedPoster: (mediaId: number) => `/${fileUrlBase}/${mediaId}/feed-poster`,
    feedVideo: (mediaId: number) => `/${fileUrlBase}/${mediaId}/feed-video`,
    uploadStatus: (uploadId: number) => `/${fileUrlBase}/uploads/${uploadId}/status`,
}

export const IdentityUrl = {
    register: `/${identityBase}/register`,
    login: `/${identityBase}/login`,
    passwordReset: `/${identityBase}/password-reset`,
    refresh: `/${identityBase}/refresh`,
    logout: `/${identityBase}/logout`,
    me: `/${identityBase}/me`,
    changeEmail: `/${identityBase}/email/change`,
    changePassword: `/${identityBase}/password`,
}
