//Requiring all packages

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// Creating the App
const app = express();

//Setting EJS as view engine
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Connecting a Database
mongoose.connect('mongodb+srv://admin-ayush:test123@cluster0.06wlj.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

//Creating a Schema
const itemsSchema = new mongoose.Schema({
	name: String
});

//Creating a mongoose model
const Item = mongoose.model("Item",itemsSchema);

//Creating data
const item1 = new Item({
	name: "Buy Food"
});

const item2 = new Item({
	name: "Cook Food"
});

const item3 = new Item({
	name: "Eat Food"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
	name: String,
	items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

	Item.find({},function(err,foundItems){
		if(foundItems.length === 0){

			Item.insertMany(defaultItems,function(err){
				if(err){console.log(err)}
				else{console.log("Inserted Default Items")}
			});
			res.redirect("/");
			
		}
		else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
	}
	});	
  

});

app.post("/", function(req, res){
	const listName = req.body.list;
	const itemName = req.body.newItem;
	const item = new Item({
		name: itemName
  });
  	if(listName === "Today"){
		item.save();
  		res.redirect("/");
	  }
	else{
		List.findOne({name: listName}, function(err,foundList){
			if(!foundList) {
				console.log("List not found")}
			else{
				foundList.items.push(item);
				foundList.save()
				res.redirect("/" + listName);
			}
				
			
			
		});
	}  

  

  });

app.post("/delete", function(req, res){
	const listName = req.body.listName;
	const checkedItemId = req.body.checkbox;

	if(listName === "Today"){
		Item.findByIdAndRemove(checkedItemId,function(err){
			if(err){console.log(err)}
			else{
				res.redirect("/");
			}
		})
	}
	else{
		List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
			if(!err){
				res.redirect("/" + listName);
			}
		})
	}
	
}) 

app.get("/:customListName",function(req,res){
	const customListName = _.capitalize(req.params.customListName);

	List.findOne({name: customListName},function(err,foundList){
		if(err){console.log(err)}
		else{
			if(!foundList){
				const list = new List({
					name: customListName,
					items: defaultItems
				})
				list.save();
				res.redirect("/" + customListName);
			}
			else{
				res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
			}
		}
	})
	

	

})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
 
app.listen(port, function() {
  console.log("Server started succesfully");
});                                           

