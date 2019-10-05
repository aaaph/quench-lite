module.exports = (sequelize, dataTypes) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV1,
        primaryKey: true
      },
      name: {
        type: dataTypes.STRING,
        allowNull: false
      },
      picture: {
        type: dataTypes.STRING(500),
        allowNull: false
      },
      email: {
        type: dataTypes.STRING,
        allowNull: false,

        validate: {
          isEmail: {
            args: true,
            msg: "email property does not follow email template (foo@bar.com)"
          },
          notEmpty: { args: true, msg: "email property cannot be empty" },
          notNull: { args: true, msg: "email is requered" },
          async isUnique(value, next) {
            const user = await sequelize.models.user.findOne({
              where: {
                email: value
              }
            });
            if (user) {
              const err = {
                message: "email address already exists",
                status: 400
              };
              await next(err);
            }
            await next();
          }
        }
      },
      facebook_id: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { args: true, msg: "facebook_id is requered" }
        }
      },
      facebook_access_token: {
        type: dataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { args: true, msg: "facebook_acces_token is requred" }
        }
      }
    },
    {
      instanceMethods: {
        test: () => {
          console.log(123);
        }
      }
    }
  );
  return User;
};
