function Timer(time, timerID, timerName) {
  this.count = time;
  this.isTicking = false;
  this.timerName = timerName;
  this.timerID = timerID;
  this.timerElement = $('#timer' + timerID);
  this.timerHours = this.timerElement.find('.timer-hours');
  this.timerMins = this.timerElement.find('.timer-mins');
  this.timerSecs = this.timerElement.find('.timer-secs');
  this.timerRow = $('#timer-row' + timerID);

  this.changeTime = function(newTime) {
    time = newTime;
    this.count = time;
  }

  // Create leading zero for numbers < 10
  function pad(t) {
    return (t < 10) ? ('0' + t) : t;
  }

  var _this = this;

  // Get clock text for timer
  this.getTimerText = function() {
    var hours = Math.floor(this.count / 36000);
    var mins = Math.floor((this.count % 36000) / 600);
    var secs = Math.floor((this.count % 600) / 10);

    this.timerHours.html(pad(hours));
    this.timerMins.html(pad(mins));
    this.timerSecs.html(pad(secs));
  }

  this.getTimerText();

  // Count down the clock
  this.countdown = function()
  {
    if (this.count > 0) {
      this.count = this.count - 1;
      this.getTimerText();
    }
    if (this.count <= 0)
    {
      // Probably unneccessary, but just in case this.count < 0
      this.count = 0; // Set this.count to 0
      this.getTimerText(); // Refresh inner HTML

      // This is where a notification (sou               nd or screen flash or something) should go
      this.timerElement.css('color','red');
      this.timerRow.removeClass('warning').removeClass('success').addClass('danger');
      this.timerRow.find('.sfx-ding').get(0).play();

      // Reset timer if auto reset box checked
      if (this.timerRow.find('.auto-reset-timer:checked').length > 0) {
        this.resetTimer();
      }

      clearInterval(this.counter);

      this.activateTriggers();

      return;
    }
  }

  this.activateTriggers = function() {
    // Triggers
    var triggerTypes = this.timerRow.find('.trigger-type-timer :selected');

    $.each(triggerTypes, function() {
      var timerRow = $(this).parents().eq(3);
      var timerID = timerRow.prop('id').substring('timer-row'.length);
      var triggerElementID = $(this).parent().prop('id');
      var triggerID = triggerElementID.substring('trigger-type'.length, triggerElementID.length - ('-timer' + timerID).length);
      var thisTriggerOptElement = $('#trigger-opts' + triggerID + '-timer' + timerID + ' :selected');
      var triggerOpt = thisTriggerOptElement.val();
      // Will Start
      if ($(this).val() == 1) {
        if (triggerOpt != 'default') {
          timers[triggerOpt].startTimer();
        }
      }
      // Will Pause
      else if ($(this).val() == 2) {
        if (triggerOpt != 'default') {
          timers[triggerOpt].pauseTimer();
        }
      }
      // Will Reset
      else if ($(this).val() == 3) {
        if (triggerOpt != 'default') {
          timers[triggerOpt].resetTimer();
        }
      }
    });
  }

  // Start the timer
  this.startTimer = function() {
    if (this.isTicking == false) {
      this.isTicking = true;
      this.timerElement.css('color','green');
      this.timerRow.removeClass('warning').removeClass('danger').addClass('success');
      this.counter = setInterval(function(){_this.countdown();}, 100);
    }
  }

  // Pause the timer
  this.pauseTimer = function() {
    if (this.isTicking == true) {
      clearInterval(this.counter);
      this.isTicking = false;
      this.timerElement.css('color','orange');
      this.timerRow.removeClass('success').removeClass('danger').addClass('warning');
    }
  }

  // Reset the timer
  this.resetTimer = function() {
    clearInterval(this.counter);
    this.isTicking = false;
    this.count = time;
    this.getTimerText();
    this.timerElement.css('color','black');
    this.timerRow.removeClass('warning').removeClass('danger').removeClass('success');
  }
}
