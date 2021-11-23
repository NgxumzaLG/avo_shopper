const express = require('express');
const exphbs  = require('express-handlebars');
let AvoShopper = require("./avo-shopper");
const pg = require("pg");
const Pool = pg.Pool;

const app = express();
const PORT =  process.env.PORT || 3019;

const connectionString = process.env.DATABASE_URL || 'postgresql://codex:pg123@localhost:5432/avo_shopper';

const pool = new Pool({
    connectionString,
	ssl : {
		rejectUnauthorized:false
	}
});

const avoShopper = AvoShopper(pool);

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

// let counter = 0;

app.get('/', async function(req, res) {
	const allShops = await avoShopper.listShops()
	res.render('index', {
		allShops
	});
});

app.post('/avo_deals', async function(req, res) {
	const shopId = req.body.the_shops;

	if (shopId != '') {
		res.redirect(`/avo_deals/${shopId}`);

	} else {
		res.redirect('/');
	}
});

app.get('/avo_deals/:id', async function(req, res) {
	const selectedShopId = req.params.id;
	const selectedShopDeals = await avoShopper.dealsForShop(selectedShopId);
	
	res.render('show-deals', {
		selectedShopDeals
	});
});

app.get('/top_five', async function(req, res) {
	const topDeals = await avoShopper.topFiveDeals()
	
	res.render('top-deals', {
		topDeals
	});
});

app.get('/add_deal', async function(req, res) {
	const theShops = await avoShopper.listShops()
	res.render('add-deal', {
		theShops
	});
});

app.post('/update_deals', async function(req, res) {
	if (req.body.shops != '') {
		await avoShopper.createDeal(req.body.shops, req.body.quantity, req.body.price);

	}
	res.redirect('/add_deal');
});

app.get('/add_shop', async function(req, res) {
	res.render('add-shop');
});

app.post('/update_shops', async function(req, res) {
	if (req.body.shops_name != '') {
		await avoShopper.createShop(req.body.shop_name);

	}
	res.redirect('/add_shop');
});

// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function() {
	console.log(`AvoApp started on port ${PORT}`)
});