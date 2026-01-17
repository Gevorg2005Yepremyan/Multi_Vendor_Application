import allowRoles from "./isValidated.js";
const validateAdminActions = allowRoles("admin");
export default validateAdminActions;