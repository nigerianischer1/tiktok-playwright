const getUser = (user) => {
  return user.charAt(0) === '@'
    ? user.substring(1).split('?')[0]
    : user.split('?')[0]
}

module.exports = getUser
