function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
function validatePhone_no(Phone_no) {
    return typeof Phone_no === "number"
}
function validatealphabet(value) {
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(value)
}
function validateNumber(value) {
    const regex = /^\+?\d+$/;
    return regex.test(value)
}

export { validateEmail, validatePhone_no, validatealphabet, validateNumber };