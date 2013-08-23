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
  exports.Chat = mongoose.model('Chat');
}

{
  var Schema = mongoose.Schema;
  var PaintSchema = new Schema({
  	x: Number,
  	y: Number,
    date: Date
  });
  mongoose.model('Paint', PaintSchema);
  exports.Paint = mongoose.model('Paint');
}

{
  var Schema = mongoose.Schema;
  var ImageSchema = new Schema({
  	src: String,
    date: Date
  });
  mongoose.model('Image', ImageSchema);
  exports.Image = mongoose.model('Image');
}

