/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

let playButton;
let videoContent;
let adDisplayContainer;
let adsLoader;
let adsManager;
let playClicked;

function init() {
  videoContent = document.getElementById('contentElement');
  playButton = document.getElementById('playButton');
  playButton.addEventListener('click', onPlayClicked);
  setUpIMA();
}

function setUpIMA() {
  adDisplayContainer = new google.ima.AdDisplayContainer(
      document.getElementById('adContainer'), videoContent);

  const adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
      'sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&' +
      'ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&' +
      'unviewed_position_start=1&' +
      'cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpost&cmsid=496&' +
      'vid=short_onecue&correlator=';
  adsRequest.setAdWillAutoPlay(false);
  adsRequest.setAdWillPlayMuted(false);
  adsRequest.linearAdSlotWidth = 640;
  adsRequest.linearAdSlotHeight = 360;
  adsRequest.nonLinearAdSlotWidth = 640;
  adsRequest.nonLinearAdSlotHeight = 150;

  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  videoContent.onended = () => {adsLoader.contentComplete();};
  adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false);
  adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false);
  adsLoader.requestAds(adsRequest);
}

function onPlayClicked() {
  // videoContent.play();
  playClicked = true;
  if (adsManager) {
    playAds();
  }
}

function playAds() {
  adDisplayContainer.initialize();
  adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
  adsManager.start();
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  const adsRenderingSettings = new google.ima.AdsRenderingSettings();
  adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  
  adsManager = adsManagerLoadedEvent.getAdsManager(
      videoContent, adsRenderingSettings);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.LOADED,
      onAdLoaded);
  adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError);

  if (playClicked) {
    playAds();
  }
}

function onContentPauseRequested() {
  videoContent.pause();
}

function onContentResumeRequested() {
  videoContent.play();
}

function onAdLoaded(adEvent) {
  if (adEvent.type == google.ima.AdEvent.Type.LOADED &&
      !adEvent.getAd().isLinear()) {
    videoContent.play();
  }
}

function onAdError(adErrorEvent) {
  console.log(adErrorEvent.getError());
  if (adsManager) {
    adsManager.destroy();
  }
  videoContent.play();
}

init();
