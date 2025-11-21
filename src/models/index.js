import Sequelize from "sequelize";
import dbConfig from "../config/database.js";

import AlertModel from "./alertModel.js";
import AlertRecipientModel from "./alertRecipient.js";

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
  }
);

const Alert = AlertModel(sequelize, Sequelize.DataTypes);
const AlertRecipient = AlertRecipientModel(sequelize, Sequelize.DataTypes);

// relationships
AlertRecipient.belongsTo(Alert, { foreignKey: "alertID" });
Alert.hasMany(AlertRecipient, { foreignKey: "alertID" });

export { sequelize, Alert, AlertRecipient };
export default { sequelize, Alert, AlertRecipient };
