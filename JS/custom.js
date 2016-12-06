$(document).ready(function(){
	$('.btn-toggle-menu').click(function(){
		$('.menu-custom-collapse').slideToggle(1000);
		});
		
	
		
$(".custom-box-warp .mob_accordian").click(function(){
        $(this).next().toggleClass('space_warp')
});

});



/**************************************/

    var $status = $('.pagingInfo');
    var $slickElement = $('.top_newes_slider');

    $slickElement.on('init reInit afterChange', function (event, slick, currentSlide, nextSlide) {
        //currentSlide is undefined on init -- set it to 0 in this case (currentSlide is 0 based)
        var i = (currentSlide ? currentSlide : 0) + 1;
        $status.text(i + '/' + slick.slideCount);
    });

$('.top_newes_slider').slick({
  dots: false,
  infinite: false,
  speed: 1200,
  slidesToShow: 1,
  autoplay: true,
  arrows: true,
  adaptiveHeight: true
});


$('.slder_container_top').slick({
  dots: true,
  infinite: true,
  speed: 1000,
  slidesToShow: 1,
  autoplay: true,
  arrows: false,
  adaptiveHeight: true
});


$('.slide_menus').slick({
  centerMode: false,
  infinite: false,
  arrows: true,
  centerPadding: '0px',
  slidesToShow: 7,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        arrows: true,
        centerMode: false,
        centerPadding: '0px',
        slidesToShow: 4
      }
    },
    {
      breakpoint: 480,
      settings: {
        arrows: true,
        centerMode: false,
        centerPadding: '0px',
        slidesToShow: 2
      }
    }
  ]
});


$('.video_slider').slick({
  dots: false,
  infinite: true,
  speed: 1000,
  slidesToShow: 1,
  autoplay: true,
  arrows: true,
  adaptiveHeight: false
});


$('.slder_work_top').slick({
  dots: true,
  infinite: true,
  speed: 1000,
  slidesToShow: 1,
  autoplay: true,
  arrows: false,
  adaptiveHeight: true
});


$('.slder_las_news_top').slick({
  dots: true,
  infinite: true,
  speed: 1000,
  slidesToShow: 1,
  autoplay: true,
  arrows: false,
  adaptiveHeight: true
});


$(document).ready(function() {
    $("#boxscroll").niceScroll({cursorborder:"",cursorcolor:"#2958a6",boxzoom:false,autohidemode: false,cursorminheight: 30,touchbehavior:false}); // First scrollable DIV
	
    
  });
  
  
  $(document).ready(function() {
    $(".custom_scroll").niceScroll({cursorborder:"",cursorcolor:"#2958a6",boxzoom:false,autohidemode: true,cursorminheight: 30,touchbehavior:false}); // First scrollable DIV
	
    
  });
  
  
  
  
$(".top_news_box > .cross_warp").on("click", function(){
		$(".top_news_box.custom-box-warp").hide();
});


$(".dropdown .dropdown-toggle").click(function(){
  $(this).next(".mega_menu_custom").toggleClass('open_drop_down')
});

$(".dropdown .menu_mob_click").click(function(){
  $(this).next(".menu_data_mob").toggleClass('open_drop_down')
});

















