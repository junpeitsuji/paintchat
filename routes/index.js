
/*
 * GET home page.
 */

exports.index = function(req, res){
  var page_limit = module.parent.exports.set('page_limit');
  res.render('index', { title: 'お絵かきチャット.js', page_limit: page_limit });
};