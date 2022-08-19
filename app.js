//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//automatically create a database called "todolistDB"
mongoose.connect("mongodb+srv://admin-walden:Wyx199832@cluster0.pud5h.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    //required: [true, "Please check your data entry, no name specified!"]
  }
})

//paras: <"SingularCollectionName">, <schemaName>
const Item = mongoose.model("Item", itemSchema);

//Mongoose document
const item1 = new Item({
  name : "Buy Food"
})
const item2 = new Item({
  name : "Cook Food"
})
const item3 = new Item({
  name : "Eat Food"
})
const defaultItem = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

// const day = date.getDate();

  //paras: <ModelName>.find({conditions}, function(err, result){})
  Item.find({}, function(error, foundItems){
    if(error){
      console.log(error);
    }else{
      if(foundItems.length == 0){
        Item.insertMany(defaultItem, function(error){
          if(error) console.log(error);
          else console.log("Successfully saved default item in database");
        })
        res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  })

  //console.log(listName);

  if(listName === "Today"){
    item.save();
    res.redirect("/");

  }else{
    List.findOne({name: listName}, function(error, foundList){

      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);

    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, function(error){
      if(!error){
        console.log("Successfully delete the item in the database.");
        res.redirect("/");
      }
    });

  }else{

    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(error, foundList){
      if(!error){
        res.redirect("/" + listName);
      }
    })
  }
})

app.get("/:customListName", function(req, res){
  //Converts the first character of string to upper case and the remaining to lower case.
  const customListName = _.capitalize(req.params.customListName);

  //'find' return a array, and 'findOne' return an object
  List.findOne({name: customListName}, function(error, foundList){
    //initialize a new list
    if(!error){
      if(!foundList){
        //Create a new list
        const list= new List({
          name: customListName,
          items: defaultItem
        })
        list.save();
        res.redirect("/" + customListName);
      }else{

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }

    }

  })

})


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
