
const fahernheitToCelcius = (f) => {
    return (f - 32) / 1.8;
}

const celciusToFahernheit = (c) => {
    return (c * 1.8) + 32;
}

module.exports = {
    fahernheitToCelcius,
    celciusToFahernheit
}