function findAndReturnResult(array, callback) {
  let foundItem = array.find((item) => callback(item));
  return foundItem && callback(foundItem);
}

export default findAndReturnResult;
