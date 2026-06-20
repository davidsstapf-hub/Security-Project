export function shuffleQuestionOrder(length, random = Math.random) {
  const order = Array.from({ length }, (_, index) => index)
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[order[index],order[swapIndex]] = [order[swapIndex],order[index]]
  }
  return order
}

export function isValidQuestionOrder(order, length) {
  return Array.isArray(order) && order.length === length && new Set(order).size === length && order.every((index) => Number.isInteger(index) && index >= 0 && index < length)
}
