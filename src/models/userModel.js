import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const User = sequelize.define(
  "User",
  {
    userID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("host", "member"),
      allowNull: false,
      defaultValue: "member",
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Users",
    timestamps: false,
  }
);

export default User;
