const crypto = require('crypto');

/**
 * Generate random string.
 *
 * @param {Number} length
 * @returns {String}
 */
module.exports = async function generateRandomString(length) {
  try {
    const randomString = await crypto.randomBytes(length).toString('hex');

    return randomString;
  } catch (error) {
    console.error('The string was not generated!');
    console.error(error);
  }
}