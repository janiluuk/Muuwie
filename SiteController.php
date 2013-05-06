<?php

class SiteController extends GxController {

    /**
     * Declares class-based actions.
     */
    private $_model;
    public $layout = "column1_menu";
    public $pageTitle = "Dashboard";

    public function filters() {
      return array('accessControl -error -login -web -watch');
    }

    public function actionCheckGenres() {

      $titles = VodTitle::model()->findAll();


      foreach ($titles as $title) {

	echo $title->title . " :" . count($title->genres)  . "<br/>";


      }

    }

    public function actionWatch($id) {
      
      $code = $this->actionPurchaseTicket($id,false);

      if (!$code) throw new Exception("No code obtained from purchase");

      $ticket = Ticket::model()->find("auth_code=:code", array("code" => $code));
      $title = VodTitle::model()->findByPk($id);
      
      if (!$ticket || !$title) throw new Exception("Transaction not done");
      

      Yii::app()->clientScript->registerScriptFile("/_js/flowplayer/flowplayer.min.js");
      
      $content = $title->contentvideos;
      if (!empty($content)) $video = $content[0];

      $rtmp_link = $video->getRtmpLink();
      $file_link = $video->getFileLink();


      $this->renderPartial("_flowplayer", array("rtmp_link" => $rtmp_link, "file_link" => $file_link, "ticket" => $ticket, "movie" => $title),false,true);
      
              
    }
    public function actionWeb() {

      $this->layout = "nothing";

        $criteria = new CDbCriteria;



        if ($filter = CHttpRequest::getQuery('filter')) {

            $criteria->condition.=' t.original_name LIKE :filter';
            $criteria->params[':filter'] = $filter . '%';
            $criteria->order = 'id desc';
        }


        if (!$movies = Yii::app()->cache->get("movies")) {
            $dependency = new CDbCacheDependency('SELECT MAX(id) FROM vod_title');
            $duration = 60 * 60 * 24; // 2 days

            $dataProvider = new CActiveDataProvider(VodTitle::model(), array('pagination' => false, 'criteria' => $criteria));
            $modeldata = $dataProvider->getData();
            $movies = array();

            foreach ((array) $modeldata as $data) {

                $movies[$data->id]["id"] = $data->id;
		$movies[$data->id]["isnew"] = (time()-strtotime($data->updated_at) > (60*60*24*14)) ? false : true;

                $movies[$data->id]["genres"] = implode(",", (array) $data->Genres);
		if ($movies[$data->id]["isnew"] == true) $movies[$data->id]["genres"] .= ",new";
	       
                $movies[$data->id]["actors"] = implode(", ", (array) $data->actors);
                $movies[$data->id]["director"] = implode(", ", (array) $data->director[0]->actor->name);
                $movies[$data->id]["year"] = $data->year;
                $movies[$data->id]["basename"] = $data->base_name;
                $movies[$data->id]["released"] = $data->released;
                $movies[$data->id]["commentscount"] = $data->commentscount;
		$movies[$data->id]["product_id"] = $data->id;

                if (!empty($data->provider))
                    $movies[$data->id]["provider"] = $data->provider->name;
                $movies[$data->id]["modified"] = Gonzales::roundedtimeago($data->updated_at);
                $movies[$data->id]["updated_at"] = $data->updated_at;
                $movies[$data->id]["title"] = $data->title;
		$posters = (array)$data->getPoster(true);
		foreach ((array)$posters as $poster) {

		  $movies[$data->id]["images"]["posters"][] = $poster->filename;
		}
		$covers = (array)$data->getCovers(true);
		foreach ((array)$covers as $poster) {

		  $movies[$data->id]["images"]["backdrops"][] = $poster->filename;
		}

                $movies[$data->id]["thumbnail"] = $movies[$data->id]["images"]["posters"][0];



            }
            Yii::app()->cache->set("movies", $movies, $duration, $dependency);
	}
        if (!$genres = Yii::app()->cache->get("genres")) {
	$genres = VodGenre::model()->findAll();
            Yii::app()->cache->set("genres", $genres, $duration, $dependency);
	}

	$directors = Credits::model()->directors()->findAll();
	foreach ((array)$directors as $director) {
	  $dirs[] = $director->actor->name;
	}


	$this->renderPartial("/site/web", array("titles" => $movies, "genres" => $genres, "directors" => $dirs));



    }
    /**
     * The script relies on a connector for the AJAX call.
     * The main function of this call is to return the directory
     * contents as a string.
     *
     * Place the following controller action in one of your controllers.
     * You can rename it whatever you wish, just remember to specify
     * the correct script parameter in the widget
     */

    public function actionFileBrowser() {
        $root = '/';

        $_POST['dir'] = urldecode($_POST['dir']);

        if (file_exists($root . $_POST['dir'])) {
            $files = scandir($root . $_POST['dir']);
            natcasesort($files);
            if (count($files) > 2) { /* The 2 accounts for . and .. */
                echo "<ul class=\"jqueryFileTree\" style=\"display: none;\">";
                // All dirs
                foreach ($files as $file) {
                    if (file_exists($root . $_POST['dir'] . $file) && $file != '.' && $file != '..' && is_dir($root . $_POST['dir'] . $file)) {
                        echo "<li class=\"directory collapsed\"><a href=\"#\" rel=\"" . htmlentities($_POST['dir'] . $file) . "/\">" . htmlentities($file) . "</a></li>";
                    }
                }
                // All files
                foreach ($files as $file) {
                    if (file_exists($root . $_POST['dir'] . $file) && $file != '.' && $file != '..' && !is_dir($root . $_POST['dir'] . $file)) {
                        $ext = preg_replace('/^.*\./', '', $file);
                        echo "<li class=\"file ext_$ext\"><a href=\"#\" rel=\"" . htmlentities($_POST['dir'] . $file) . "\">" . htmlentities($file) . "</a></li>";
                    }
                }
                echo "</ul>";
            }
        }
    }

    public function actionFiles() {

        Yii::import("application.components.Filemanager.elFinder");
        Yii::import("application.components.Filemanager.elFinderConnector");
        Yii::import("application.components.Filemanager.elFinderVolumeLocalFileSystem");
        Yii::import("application.components.Filemanager.elFinderVolumeDriver");

	$opts = array(
		      'debug' => false,
		      'roots' => array(
				       array(
			'driver'        => 'LocalFileSystem',  // driver for accessing file system (REQUIRED)
			'path'          => Yii::app()->params["file_manager"]["path"],
			'URL'           => Yii::app()->params["file_manager"]["url"], // URL to files (REQUIRED)
			'accessControl' => 'access'             // disable and hide dot starting files (OPTIONAL)
		)
				       )
		      );

	// run elFinder
	$connector = new elFinderConnector(new elFinder($opts));
	$connector->run();

    }

    public function actionFile_manager() {

        $this->pageTitle = "File Manager";


	  
	  if (Yii::app()->request->isAjaxRequest) {
            echo CJSON::encode(array(
                'status' => 'success',
                'content' => $this->renderPartial('file_manager', array(), true, false)
            ));
        } else
            $this->render('file_manager');
    }
  
    public function accessRules() {
        return array(
            array('allow', // allow authenticated users to access    
                // all actions                                     
                'controllers' => array('ApiController'),
                'users' => array('*'),
            ),
            array('allow', // allow authenticated users to access    
                // all actions                                     
                'users' => array('@'),
            ),
            array('deny', // deny all users                        		
                'users' => array('*'),
            ),
        );
    }

    public function actionPurchaseTicketDialog() {

      $this->ajaxRenderPlain("_generate_ticket", '$(":date").datepicker({
        dateFormat : "dd.mm.yy"
    }); reloadStyle(); ');

    }


    public function actionPurchaseTicket($id, $print=true) {


        $suffix = "?api_key=12345&ip_address=127.0.0.1";
        $user = GonzalesUser::model()->findByPk(1);
        $email = $user->profile->email;

        $url = "http://gonzales.vifi.ee/api/get_token/" . $email . $suffix;

        $contents = simplexml_load_file($url);
        $token = $contents->token;

        $url = "http://gonzales.vifi.ee/api/purchase/" . $id . "/" . $token . "/1/19/16/0" . $suffix;

        $contents = simplexml_load_file($url);


        $activation_key = $contents->authcode;
	if ($print)  echo $activation_key;

        return $activation_key;
    }

    public function actions() {
        return array(
            // captcha action renders the CAPTCHA image displayed on the contact page
            'captcha' => array(
                'class' => 'CCaptchaAction',
                'backColor' => 0xFFFFFF,
            ),
            // page action renders "static" pages stored under 'protected/views/site/pages'
            // They can be accessed via: index.php?r=site/page&view=FileName
            'page' => array(
                'class' => 'CViewAction',
            ),
            'elfinder.' => 'widgets.elFinder.FinderWidget',
        );
    }

    /**
     * This is the action to handle external exceptions.
     */
    public function actionSales() {

        $this->pageTitle = "Sales overview";
        Yii::app()->clientScript->registerScriptFile(XHtml::jsUrl("jquery.flot.js"),CClientScript::POS_HEAD);

        $this->render('sales', array("stats" => $stats),false,true);
    }
    public function actionStatistics($stat, $mode) {
        
            $stats = $this->getStats($mode);
            
            if (!empty($_REQUEST["model"])) $model = new $_REQUEST["model"]("search");
            else $model = TicketBill::model();            
            $stat_item = str_replace("stats_", "", $stat);
            
            
            if (!empty($stats[$stat_item]["scope"])) $provider = $model->$stats[$stat_item]["scope"]()->getStatisticsData($mode, 10000, "");
            else $provider = $model->getStatisticsData($mode, 10000, "");
           
            

        if (Yii::app()->getRequest()->getIsPostRequest() && (!empty($_REQUEST["mode"]))) {
            $this->ajaxRender('_datatables', array('provider' => $provider, 'title' =>  $stats[$stat_item]["title"],'columns' => (array)$stats[$stat_item]["columns"]));
            return;
        } else {
            echo json_encode($widget->getFormattedData(intval($_REQUEST['sEcho'])));
            Yii::app()->end();
        }
            
    }
    public function getStats($justmode="") {
          
        $modes = array( "today","yesterday","this_week","last_week","this_month");

        foreach ($modes as $mode) {

            $stats[$mode] = array(
            "messages" => array("color" => "orange", "model" => "YumMessage","title" => "Messages", "value" => YumMessage::model()->cache(3600)->$mode()->count()),
            "registrations" => array("title" => "Registrations", "value" => count(YumUser::model()->getRegisteredUsers($mode))),
            "comments" => array("model" => "Comment", "color" => "orange", "title" => "Comments", "columns" => array(array('value' => '$data->User->username')), "value" => Comment::model()->getStatisticsAmount($mode)),
            "orders" => array("title" => "Purhases", "scope" => "not_free", "model" => "Ticket", "columns" => array(array('value' => 'Gonzales::formatDateTime($data->validfrom)'), array('value'=> '$data->Titles[0]->title'), array('value' => '$data->User->profile->email'), array('value' => '$data->Bill->price->price')), "value" => Ticket::model()->getStatisticsAmount($mode, 10000, "not_free")),
            "transactions" => array( "title" => "Transactions", "value" => TicketBill::model()->not_free()->getStatisticsAmount($mode)),
            "ratings" => array("model" => "Rating","title" => "Ratings", "value" => Rating::model()->getStatisticsAmount($mode)),
            "errors" => array("model" => "ContentDistributorLog","color" => "red", "title" => "Errors", "value" => ContentDistributorLog::model()->getStatisticsAmount($mode, 10000, "error")),
             "titles" => array("color" => "blue","model" => "VodTitle", "columns" => array(array('type' => 'html', 'name' => 'Title', 'value' => '"<a href=\"/vodTitle/$data->id\">" . $data->title . "</a>"'), array('name' => 'created_at', 'value' => 'Gonzales::formatDateTime(strtotime($data->created_at))'), array('value' => '$data->purchasecount', 'name' => 'purchased')), "title" => "New titles", "value" => VodTitle::model()->getStatisticsAmount($mode)),
             "money" => array("color" => "blue", "model" => "TicketBill","columns" => array(array('value' => 'Gonzales::formatDateTime(strtotime($data->created_at))'),array('value' => '$data->price_amount'), array("value" => '$data->method->name'), array('value' => '$data->ticket[0]->Titles[0]->title')),"title" => "Amount received €", "value" => TicketBill::model()->getStatisticsCount($mode, 10000, "", "price_amount") . "€"),                    ); }
        
        if (!empty($justmode)) return $stats[$justmode];
        
        return $stats;
    }
    /**
     * This is the action to handle external exceptions.
     */
    public function actionIndex() {

        $this->pageTitle = "Statistics";

        /* Campaigns */
        $campaignlist = VodCampaign::model()->cache(3600)->active()->findAll();
        foreach ((array) $campaignlist as $campaign) {

	  $campaigns[$campaign->id]["link"] = CHtml::link($campaign->name, "/vodCampaign/" . $campaign->id);
	  $campaigns[$campaign->id]["name"] = $campaign->name;
	  $campaigns[$campaign->id]["valid_from"] = $campaign->valid_from;
	  $campaigns[$campaign->id]["valid_to"] = $campaign->valid_to;
	  $campaigns[$campaign->id]["tickets_total"] = $campaign->TicketCount;
            $campaigns[$campaign->id]["tickets_used"] = count($campaign->UsedTickets);
        }


        $mode = "today";

        $stats = $this->getStats();
        
        
        $this->render('index', array("campaigns" => $campaigns, "content" => $content, "mode" => $mode, "stats" => $stats));
    }

    /**
     * This is the action to handle external exceptions.
     */
    public function actionError() {
        $this->layout = "//layouts/error/error";
   
        if ($error = Yii::app()->errorHandler->error) {
            $this->pageTitle = "Error";
            if ($error["code"] >= 500) $view = "//site/error";
            else $view = "//site/error_simple";
            
	    
            if (Yii::app()->request->isAjaxRequest)
                echo $error['message'];
            else
                $this->render($view, $error);
        }
    }

    /**
     * Displays the contact page
     */
    public function actionContact() {
        $model = new ContactForm;
        if (isset($_POST['ContactForm'])) {
            $model->attributes = $_POST['ContactForm'];
            if ($model->validate()) {
                $headers = "From: {$model->email}\r\nReply-To: {$model->email}";
                mail(Yii::app()->params['adminEmail'], $model->subject, $model->body, $headers);
                Yii::app()->user->setFlash('contact', 'Thank you for contacting us. We will respond to you as soon as possible.');
                $this->refresh();
            }
        }
        $this->render('contact', array('model' => $model));
    }

    public function actionActivity() {

        $this->pageTitle = "Activity";
        Yii::app()->clientScript->registerScriptFile("/js/site/jquery.dataTables.min.js", CClientScript::POS_END);
        Yii::app()->clientScript->registerCssFile('/css/site/jquery.ui.datatables.css');

        $criteria = new CDbCriteria;

        // bro-tip: $_REQUEST is like $_GET and $_POST combined
        if (isset($_REQUEST['sSearch']) && isset($_REQUEST['sSearch']{0})) {
            // use operator ILIKE if using PostgreSQL to get case insensitive search
            $criteria->with = array(array("user" => "profile"));
            
            $criteria->addSearchCondition('t.action', $_REQUEST['sSearch'],true  );
       
        }   


        $sort = new EDTSort('YumActivity', array(
           'id', 'timestamp', '', 'action','message','ip_address'));

        
        $pagination = new EDTPagination();

        // eager loading, because sorting is done before pagination (OFFSET/LIMIT)
        $columns = array(
            array('value' => ''),
            array('value' => 'date("d.m.y H:i",strtotime($data->timestamp))', 'name'=>'timestamp', 'type' => 'text'), 
            array('value' => 'substr($data->user->profile->email,0,20)', 'name' => 'user.profile.email'),
            array('value' => 'substr($data->action,0,25) . ".."' , 'name' => 'action'), 
            array('value' => 'substr($data->message,0,25) . ".."', 'name' => 'message'), 
            'ip_address:text',
         array( 'class' => 'ext.EDataTables.EButtonColumn',
        'template' => '{view}',
        'header' => Yii::t('app','Operations'),

        ));

        $sort->attributes = array(
            // atributes from $model
				  
            

            // a virtual attribute, key is the column name
        );  

        $dataProvider = new CActiveDataProvider('YumActivity', array(
                    'criteria' => $criteria,
                    'pagination' => $pagination,
                    'sort' => $sort,
                ));


        $widget = $this->createWidget('ext.EDataTables.EDataTables', array(
            'id' => 'activity',
            'dataProvider' => $dataProvider,
            'ajaxUrl' => Yii::app()->getBaseUrl() . '/site/activity',
            'columns' => $columns,
            
            'buttons' => array( 'class' => 'ext.EDataTables.EButtonColumn'),
                ));
        if (!Yii::app()->getRequest()->getIsAjaxRequest()) {
            $this->render('activity', array('widget' => $widget));
            return;
        } else {
            echo json_encode($widget->getFormattedData(intval($_REQUEST['sEcho'])));
            Yii::app()->end();
        }
    }

    /**
     * this action executes every single cron                                                                      
     */
    public function actionCron() {
        Cronzales::init();
        Cronzales::add(new CJCleanupUsers);
        Cronzales::add(new CJUnban);
        foreach (Yii::app()->controller->module->crons as $c) {
            Cronzales::add(new $c);
        }
        Cronzales::run();
    }

    /**
     * save the cron data
     * @param Array $formData
     */
    private function cronSave($formData) {
        $successes = 0;
        foreach ($formData as $cron => $value) {
            $model = $this->loadCron($cron);
            $model->lapse = is_numeric($value) ? (int) $value : $model->lapse;
            if ($model->save())
                $successes++;
        }
        if ($successes == count($formData))
            Yii::app()->user->setFlash('crons', 'Cron Jobs Configuration Saved');
        else
            Yii::app()->user->setFlash('crons', 'A problem occurred during the cron jobs configuration save action');


        $this->redirect(Yii::app()->baseUrl . '/site');
    }

    /**
     * remove not installed cronjobs
     */
    private function cronRemove() {
        // load the cronjobs
        Cronzales::init();
        Cronzales::add(new CJGarbageCollection);
        Cronzales::add(new CJCleanupUsers);
        foreach (Yii::app()->controller->module->crons as $c) {
            Cronzales::add(new $c);
        }
        // load the cronjobs
        $crons = Cron::model()->findAll();
        foreach ($crons as $c) {
            if (Cronzales::getStatus($c->name) === Cronzales::NOT_INSTALLED)
                $c->delete();
        }
        Yii::app()->user->setFlash('crons', 'Cron Jobs successfully removed');

        $this->redirect(Yii::app()->baseUrl . '/site/admin');
    }

    /*
     * Displays the current configurations  
     */

    public function actionViewConfig() {

        $cronDataProvider = new CActiveDataProvider('Cron', array('pagination' => array('pageSize' => 10),));

        // checks if the cron form has been sent                                                               
        if (isset($_POST['Cron']))
            $this->cronSave($_POST['Cron']);

        // checks if the cron remove form has been sent                                                        
        if (isset($_POST['CronRemove']))
            $this->cronRemove();

        if (Yii::app()->request->isAjaxRequest)
            $this->renderPartial('viewconfig', array('cronDataProvider' => $cronDataProvide), false, true);
        else
            $this->render('viewconfig', array('cronDataProvider' => $cronDataProvider));
    }

    /**
     * Displays the login page
     */
    public function actionLogin() {
        $model = new LoginForm;

        // if it is ajax validation request
        if (isset($_POST['ajax']) && $_POST['ajax'] === 'login-form') {
            echo CActiveForm::validate($model);
            Yii::app()->end();
        }

        // collect user input data
        if (isset($_POST['LoginForm'])) {
            $model->attributes = $_POST['LoginForm'];
            // validate user input and redirect to the previous page if valid
            if ($model->validate() && $model->login())
                $this->redirect(Yii::app()->user->returnUrl);
        }
        // display the login form
        $this->render('login', array('model' => $model));
    }

    /**
     * Logs out the current user and redirect to homepage.
     */
    public function actionLogout() {
        Yii::app()->user->logout();
        $this->redirect(Yii::app()->homeUrl);
    }

}

?>