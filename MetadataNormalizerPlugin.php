/**
 * UNIFIED METADATA NORMALIZER PLUGIN FOR OJS 3.5.0
 * Complete Production-Ready Package
 * 
 * FILE 1: MetadataNormalizerPlugin.php
 * Main plugin class with hook registration
 */

<?php

/**
 * @file plugins/generic/metadataNormalizer/MetadataNormalizerPlugin.php
 *
 * Copyright (c) 2014-2025 Simon Fraser University
 * Copyright (c) 2003-2025 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @class MetadataNormalizerPlugin
 * @brief Unified plugin for normalizing submission metadata (keywords, title, abstract)
 * 
 * This plugin automatically cleans and normalizes metadata fields to ensure:
 * - Clean indexing for academic databases
 * - Consistent formatting across submissions
 * - Removal of copy-paste artifacts and formatting issues
 * - Improved discoverability and metadata quality
 */

namespace APP\plugins\generic\metadataNormalizer;

use PKP\plugins\GenericPlugin;
use PKP\plugins\Hook;
use APP\core\Application;

class MetadataNormalizerPlugin extends GenericPlugin
{
    /**
     * @copydoc Plugin::register()
     */
    public function register($category, $path, $mainContextId = null): bool
    {
        $success = parent::register($category, $path, $mainContextId);
        
        if ($success && $this->getEnabled($mainContextId)) {
            // Register template display hook for JavaScript injection
            Hook::add('TemplateManager::display', [$this, 'handleTemplateDisplay']);
        }
        
        return $success;
    }
    
    /**
     * Hook callback: Inject JavaScript files on relevant pages
     * 
     * @param string $hookName Hook name
     * @param array $args Hook arguments [TemplateManager, template, sendContentType, charset, output]
     * @return bool Hook processing status
     */
    public function handleTemplateDisplay(string $hookName, array $args): bool
    {
        $templateMgr = $args[0];
        $template = $args[1];
        
        // Only inject scripts on relevant pages
        if (!$this->shouldInjectScripts($template)) {
            return false;
        }
        
        $request = $this->getRequest();
        $baseUrl = $request->getBaseUrl();
        $pluginPath = $this->getPluginPath();
        
        // Inject shared utilities first
        $sharedUrl = $baseUrl . '/' . $pluginPath . '/js/shared.js';
        $templateMgr->addJavaScript(
            'metadataNormalizer-shared',
            $sharedUrl,
            [
                'contexts' => 'frontend',
                'priority' => STYLE_SEQUENCE_NORMAL
            ]
        );
        
        // Inject keywords normalizer
        $keywordsUrl = $baseUrl . '/' . $pluginPath . '/js/keywordsNormalizer.js';
        $templateMgr->addJavaScript(
            'metadataNormalizer-keywords',
            $keywordsUrl,
            [
                'contexts' => 'frontend',
                'priority' => STYLE_SEQUENCE_NORMAL
            ]
        );
        
        // Inject title & abstract normalizer
        $metadataUrl = $baseUrl . '/' . $pluginPath . '/js/metadataNormalizer.js';
        $templateMgr->addJavaScript(
            'metadataNormalizer-fields',
            $metadataUrl,
            [
                'contexts' => 'frontend',
                'priority' => STYLE_SEQUENCE_NORMAL
            ]
        );
        
        return false; // Don't interrupt other plugins
    }
    
    /**
     * Determine if scripts should be injected for this template
     * 
     * @param string $template Template path
     * @return bool True if scripts should be injected
     */
    private function shouldInjectScripts(string $template): bool
    {
        // Pages where metadata forms appear
        $relevantTemplates = [
            'submission/form',                      // Author submission wizard
            'workflow',                             // Editorial workflow
            'authorDashboard',                      // Author dashboard
            'controllers/modals/submissionMetadata',// Metadata edit modals
            'frontend/pages/submission',            // Submission pages
            'controllers/tab/settings',             // Settings tabs
            'controllers/grid/submissions'          // Submission grids
        ];
        
        foreach ($relevantTemplates as $pattern) {
            if (str_contains($template, $pattern)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @copydoc Plugin::getDisplayName()
     */
    public function getDisplayName(): string
    {
        return __('plugins.generic.metadataNormalizer.displayName');
    }
    
    /**
     * @copydoc Plugin::getDescription()
     */
    public function getDescription(): string
    {
        return __('plugins.generic.metadataNormalizer.description');
    }
    
    /**
     * @copydoc Plugin::getInstallMigration()
     */
    public function getInstallMigration()
    {
        // No database changes required - client-side only
        return null;
    }
}
