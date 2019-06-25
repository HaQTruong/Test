var express= require('express');

var morgan= require('morgan');
var hbs_sections = require('express-handlebars-sections');
var exphbs  = require('express-handlebars');
var createError = require('http-errors');
var numeral = require('numeral');
var app = express();

app.use(morgan('dev'));
app.engine('hbs', exphbs({
  layoutsDir: 'views/layouts',
  defaultLayout: 'main.hbs',
  helpers: {
    format_number: val => {
      return numeral(val).format('0,0');
    },
    section: hbs_sections()
  }
}));
app.set('view engine', 'hbs');
app.use(express.urlencoded({
  extended: true
}));
//public
app.use(express.json());
app.use(express.static('Public'));


require('./middlewares/session')(app);
require('./middlewares/passport')(app);
require ('./middlewares/upload')(app);

app.use(require('./middlewares/Chuyenmuc.mdw'));
app.use(require('./middlewares/Baiviet.mdw'));

app.engine('hbs', exphbs({
    layoutsDir: 'views/layouts',
    defaultLayout: 'main.hbs',
    helpers: {
      section: hbs_sections()
    }
}));

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({
  extended: true
}));

app.use(require('./middlewares/auth.mdw'));



app.use('/chuyenmuc', require('./Routers/Chuyenmuc'));
app.use('/chuyenmuccon', require('./Routers/Chuyenmuccon'));
app.use('/baiviet',require('./Routers/Baiviet'));
app.use('/search', require('./Routers/Search'));
app.use('/account', require('./Routers/account'));
app.use('/binhluan', require('./Routers/Binhluan'));
app.use('/tag', require('./Routers/Tag'));

var restricted = require('../Project/middlewares/adminres');

app.use('/admin/chuyenmuc',restricted, require('./Routers/administrator/ChuyenMuc'));
app.use('/admin/chuyenmuccon',restricted,require('./Routers/administrator/ChuyenMucCon'));
app.use('/admin/tag',restricted,require('./Routers/administrator/Tag'));
app.use('/admin/baiviet',restricted, require('./Routers/administrator/Baiviet'));
app.use('/admin/taikhoan',restricted, require('./Routers/administrator/TaiKhoan'));

//Admin

app.get('/admin',restricted,(req, res) => {
  res.render('vwAdministrator/dashboard.hbs', {
    layout: 'admin.hbs'
  })
});


app.get('/', (req, res)=> {    
    res.render('home');    
});
app.get('/error', (req, res) => {
    res.render('error', { layout: false });
  })
  
  app.use((req, res, next) => {
    next(createError(404));
  })
  
  app.use((err, req, res, next) => {
  
    var status = err.status || 500;
    var vwErr = 'error';
  
    if (status === 404) {
      vwErr = '404';
    }
  
    // app.set('env', 'prod');
    // var isProd = app.get('env') === 'prod';
  
    process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
    var isProd = process.env.NODE_ENV === 'prod';
    var message = isProd ? 'An error has occured. Please contact administartor for more support.' : err.message;
    var error = isProd ? {} : err;
  
    var message = isProd ? 'An error has occured. Please contact administartor for more support.' : err.message;
    var error = isProd ? {} : err;
  
    res.status(status).render(vwErr, {
      layout: false,
      message,
      error
    });
  })
app.listen('3000', ()=>{
    console.log("Sever is running at port 3000");
});


