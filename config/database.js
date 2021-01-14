const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const logger = require('../config/logger')

const sequelize = new Sequelize('postgres://'+process.env.POSTGRES_USER+':'+process.env.POSTGRES_PASSWORD+'@'+process.env.POSTGRES_URI+':'+process.env.POSTGRES_PORT+'/'+process.env.POSTGRES_DB, {
  logging: (...msg) => {
      if (msg[0].indexOf('INSERT ') > 0 || msg[0].indexOf('UPDATE ') > 0) logger.info(msg[0])
    }
})
sequelize.authenticate().then(() => {
  logger.info('Connection to database has been established successfully.');
}).catch((err) => {
  logger.error('Unable to connect to the database:', err);
});

let db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

let model = require('../models/user.model')(db.sequelize, Sequelize);
model = require('../models/page.model')(db.sequelize, Sequelize);
model = require('../models/user.profile.model')(db.sequelize, Sequelize);
model = require('../models/user.insights.model')(db.sequelize, Sequelize);
model = require('../models/user.insights.detailed.model')(db.sequelize, Sequelize);
model = require('../models/user.insights.lifetime.model')(db.sequelize, Sequelize);
model = require('../models/media.model')(db.sequelize, Sequelize);
model = require('../models/media.insights.model')(db.sequelize, Sequelize);
model = require('../models/story.model')(db.sequelize, Sequelize);
model = require('../models/story.insights.model')(db.sequelize, Sequelize);

db.User = db.sequelize.models['User'];
db.Page = db.sequelize.models['Page'];
db.UserInsight = db.sequelize.models['UserInsight'];
db.UserDetailedInsight = db.sequelize.models['UserDetailedInsight'];
db.UserLifetimeInsight = db.sequelize.models['UserLifetimeInsight'];
db.UserProfile = db.sequelize.models['UserProfile'];
db.Media = db.sequelize.models['Media'];
db.MediaInsight = db.sequelize.models['MediaInsight'];
db.Story = db.sequelize.models['Story'];
db.StoryInsight = db.sequelize.models['StoryInsight'];

db.sequelize.sync({ alter: true }).then(() => { logger.info('Database models synchronised')}).catch( (err) => {logger.error(err.original)});
// db.sequelize.sync({ force: true });

module.exports = db;