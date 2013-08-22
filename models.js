var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/chat_app');

// mongoose
{
  var Schema = mongoose.Schema;
  var ChatSchema = new Schema({
    message: String,
    date: Date
  });
  mongoose.model('Chat', ChatSchema);
}

{
  var Schema = mongoose.Schema;
  var PaintSchema = new Schema({
  	x: Number,
  	y: Number,
    date: Date
  });
  mongoose.model('Paint', PaintSchema);
}

{
  var Schema = mongoose.Schema;
  var ImageSchema = new Schema({
  	src: String,
    date: Date
  });
  mongoose.model('Image', ImageSchema);
}

var Chat = mongoose.model('Chat');
var Paint = mongoose.model('Paint');
var Image = mongoose.model('Image');

exports.Chat = Chat;
exports.Paint = Paint;
exports.Image = Image;
