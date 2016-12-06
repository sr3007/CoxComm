<div class="actyammerplug">
	<h3 role="heading" aria-level="1">Yammer</h3>
	<div id="embedded-feed" style="width:400px;height:583px;position: absolute;"></div> 
</div>
<script type="text/javascript" src="https://c64.assets-yammer.com/assets/platform_embed.js"></script>
<script type="text/javascript"> 
	yam.connect.embedFeed({
	  "config": {
		"use_sso": true,
		"header": false,
		"footer": false,
		"showOpenGraphPreview": false,
		"defaultToCanonical": false,
		"hideNetworkName": true
	  },
	  "feedType": "topic",
	  "container": "#embedded-feed"
	});
</script>	